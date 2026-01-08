/**
 * Store combinado único que gerencia todo o estado da aplicação
 * Reduz múltiplas escritas no localStorage para uma única escrita por mudança
 */
import { writable, derived, get } from 'svelte/store';
import { loadState, saveState, flushPendingSave, clearStorage } from '../services/storageService';
import type { AppState, User, Message, GroupSettings, PhoneTheme } from '../types';

// Estado padrão
const defaults: AppState = {
  users: [
    { id: 'alice', name: 'Alice', color: '#ff6b6b' },
    { id: 'bob', name: 'Bob', color: '#4ecdc4' },
    { id: 'charlie', name: 'Charlie', color: '#45b7d1' },
  ],
  messages: [
    { id: 'm1', text: 'Oi! Como você está?', userId: 'alice', createdAt: Date.now() - 120000 },
    { id: 'm2', text: 'Tudo bem, e você?', userId: 'bob', createdAt: Date.now() - 60000 },
  ],
  currentUserId: 'alice',
  selectedUserIds: ['alice', 'bob'],
  wallpaper: null,
  groupSettings: { name: 'Gossip Girl', avatar: null },
  phoneTheme: {
    frameColor1: '#667eea',
    frameColor2: '#764ba2',
    screenBgColor: '#f0f4f8',
    screenBgImage: null,
    frameGradientAngle: 135,
    displayTime: '9:41',
  },
};

// Carregar estado inicial
const initialState = loadState() ?? defaults;

// Store principal combinado
export const appState = writable<AppState>(initialState);

// Stores derivados para compatibilidade com código existente
export const users = derived(appState, ($state) => $state.users);
export const messages = derived(appState, ($state) => $state.messages);
export const currentUserId = derived(appState, ($state) => $state.currentUserId);
export const selectedUserIds = derived(appState, ($state) => $state.selectedUserIds);
export const wallpaper = derived(appState, ($state) => $state.wallpaper);
export const groupSettings = derived(appState, ($state) => $state.groupSettings);
export const phoneTheme = derived(appState, ($state) => $state.phoneTheme);

// Inscrever no store principal para salvar automaticamente com debounce
appState.subscribe((state) => {
  saveState(state);
});

// Garantir que dados sejam salvos antes de fechar a página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushPendingSave();
  });
  
  // Também salvar quando a página fica oculta (mobile)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      flushPendingSave();
    }
  });
}

// Funções de atualização do estado
function updateState(updater: (state: AppState) => AppState): void {
  appState.update(updater);
}

/**
 * Adiciona uma nova mensagem de texto
 * @param text - Texto da mensagem
 * @param userId - ID do usuário que enviou a mensagem
 * @returns A mensagem criada
 */
export function addMessage(text: string, userId: string): Message {
  const id = Math.random().toString(36).slice(2, 9);
  const msg: Message = { id, text, userId, createdAt: Date.now() };
  updateState((state) => ({
    ...state,
    messages: [...state.messages, msg],
  }));
  return msg;
}

/**
 * Remove uma mensagem pelo ID
 * @param id - ID da mensagem a ser removida
 */
export function removeMessage(id: string): void {
  updateState((state) => ({
    ...state,
    messages: state.messages.filter((m) => m.id !== id),
  }));
}

/**
 * Edita o texto de uma mensagem existente
 * @param id - ID da mensagem a ser editada
 * @param text - Novo texto da mensagem
 */
export function editMessage(id: string, text: string): void {
  updateState((state) => ({
    ...state,
    messages: state.messages.map((m) => (m.id === id ? { ...m, text } : m)),
  }));
}

/**
 * Adiciona uma nova mensagem de imagem
 * @param userId - ID do usuário que enviou a mensagem
 * @param imageDataUrl - Data URL da imagem (base64)
 * @returns A mensagem criada
 */
export function addImageMessage(userId: string, imageDataUrl: string): Message {
  const id = Math.random().toString(36).slice(2, 9);
  const msg: Message = { id, text: '', userId, createdAt: Date.now(), type: 'image', image: imageDataUrl };
  updateState((state) => ({
    ...state,
    messages: [...state.messages, msg],
  }));
  return msg;
}

/**
 * Adiciona um novo usuário/personagem
 * @param name - Nome do usuário
 * @param color - Cor hexadecimal do usuário
 * @returns O usuário criado
 */
export function addUser(name: string, color: string): User {
  const id = Math.random().toString(36).slice(2, 9);
  const user: User = { id, name, color };
  updateState((state) => ({
    ...state,
    users: [...state.users, user],
  }));
  return user;
}

export function setUserAvatar(userId: string, avatar: string | null): void {
  updateState((state) => ({
    ...state,
    users: state.users.map((u) => (u.id === userId ? { ...u, avatar } : u)),
  }));
}

export function updateUserName(userId: string, name: string): void {
  updateState((state) => ({
    ...state,
    users: state.users.map((u) => (u.id === userId ? { ...u, name } : u)),
  }));
}

export function setUserColor(userId: string, color: string): void {
  updateState((state) => ({
    ...state,
    users: state.users.map((u) => (u.id === userId ? { ...u, color } : u)),
  }));
}

export function removeUser(userId: string): void {
  updateState((state) => {
    const remainingUsers = state.users.filter((u) => u.id !== userId);
    const newCurrentUserId = 
      state.currentUserId === userId && remainingUsers.length > 0
        ? remainingUsers[0].id
        : state.currentUserId;
    
    return {
      ...state,
      users: remainingUsers,
      messages: state.messages.filter((m) => m.userId !== userId),
      selectedUserIds: state.selectedUserIds.filter((id) => id !== userId),
      currentUserId: newCurrentUserId,
    };
  });
}

// Funções de configurações
export function setWallpaper(dataUrl: string | null): void {
  updateState((state) => ({
    ...state,
    wallpaper: dataUrl,
  }));
}

export function setGroupName(name: string): void {
  updateState((state) => ({
    ...state,
    groupSettings: { ...state.groupSettings, name },
  }));
}

export function setGroupAvatar(avatar: string | null): void {
  updateState((state) => ({
    ...state,
    groupSettings: { ...state.groupSettings, avatar },
  }));
}

export function setPhoneTheme(theme: Partial<PhoneTheme>): void {
  updateState((state) => ({
    ...state,
    phoneTheme: { ...state.phoneTheme, ...theme },
  }));
}

export function setCurrentUserId(userId: string): void {
  updateState((state) => ({
    ...state,
    currentUserId: userId,
  }));
}

export function setSelectedUserIds(ids: string[]): void {
  updateState((state) => ({
    ...state,
    selectedUserIds: ids,
  }));
}

/**
 * Limpa todo o estado da aplicação, restaurando os valores padrão
 */
export function clearState(): void {
  appState.set(defaults);
  clearStorage();
}

