import { writable, get } from 'svelte/store';

// Tipos
export type User = {
  id: string;
  name: string;
  color: string;
  avatar?: string | null;
};

export type Message = {
  id: string;
  text: string;
  userId: string;
  createdAt: number;
  type?: 'text' | 'image'; // 'text' ou 'image'
  image?: string | null; // base64 da imagem se type === 'image'
};

export type GroupSettings = {
  name: string;
  avatar?: string | null;
};

export type PhoneTheme = {
  frameColor1: string; // cor 1 do frame
  frameColor2: string; // cor 2 do frame
  screenBgColor: string; // cor do background da tela
  screenBgImage?: string | null; // imagem do background da tela
  frameGradientAngle: number; // ângulo do gradiente do frame
};

const LS_KEY = 'chat-generator-state-v2';

// Verificar se localStorage está disponível
const isLocalStorageAvailable = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Carregar estado inicial do localStorage
function loadState() {
  try {
    if (!isLocalStorageAvailable) return null;
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao carregar state', e);
    return null;
  }
}

function saveState(state: { users: User[]; messages: Message[]; currentUserId: string; selectedUserIds: string[]; wallpaper: string | null; groupSettings: GroupSettings; phoneTheme: PhoneTheme }) {
  try {
    if (!isLocalStorageAvailable) return;
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Erro ao salvar state', e);
  }
}

// Defaults
const defaults = {
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
  groupSettings: { name: 'Meu Grupo', avatar: null },
  phoneTheme: {
    frameColor1: '#667eea',
    frameColor2: '#764ba2',
    screenBgColor: '#f0f4f8',
    screenBgImage: null,
    frameGradientAngle: 135,
  },
};

const initial = loadState() ?? defaults;

export const users = writable<User[]>(initial.users);
export const messages = writable<Message[]>(initial.messages);
export const currentUserId = writable<string>(initial.currentUserId);
export const selectedUserIds = writable<string[]>(initial.selectedUserIds);
export const wallpaper = writable<string | null>(initial.wallpaper);
export const groupSettings = writable<GroupSettings>(initial.groupSettings);
export const phoneTheme = writable<PhoneTheme>(initial.phoneTheme);

// Inscrever para salvar automaticamente
users.subscribe((u) => {
  saveState({ users: u, messages: get(messages), currentUserId: get(currentUserId), selectedUserIds: get(selectedUserIds), wallpaper: get(wallpaper), groupSettings: get(groupSettings), phoneTheme: get(phoneTheme) });
});
messages.subscribe((m) => {
  saveState({ users: get(users), messages: m, currentUserId: get(currentUserId), selectedUserIds: get(selectedUserIds), wallpaper: get(wallpaper), groupSettings: get(groupSettings), phoneTheme: get(phoneTheme) });
});
currentUserId.subscribe((c) => {
  saveState({ users: get(users), messages: get(messages), currentUserId: c, selectedUserIds: get(selectedUserIds), wallpaper: get(wallpaper), groupSettings: get(groupSettings), phoneTheme: get(phoneTheme) });
});
selectedUserIds.subscribe((s) => {
  saveState({ users: get(users), messages: get(messages), currentUserId: get(currentUserId), selectedUserIds: s, wallpaper: get(wallpaper), groupSettings: get(groupSettings), phoneTheme: get(phoneTheme) });
});
wallpaper.subscribe((w) => {
  saveState({ users: get(users), messages: get(messages), currentUserId: get(currentUserId), selectedUserIds: get(selectedUserIds), wallpaper: w, groupSettings: get(groupSettings), phoneTheme: get(phoneTheme) });
});
groupSettings.subscribe((g) => {
  saveState({ users: get(users), messages: get(messages), currentUserId: get(currentUserId), selectedUserIds: get(selectedUserIds), wallpaper: get(wallpaper), groupSettings: g, phoneTheme: get(phoneTheme) });
});
phoneTheme.subscribe((t) => {
  saveState({ users: get(users), messages: get(messages), currentUserId: get(currentUserId), selectedUserIds: get(selectedUserIds), wallpaper: get(wallpaper), groupSettings: get(groupSettings), phoneTheme: t });
});

export function addMessage(text: string, userId: string) {
  const id = Math.random().toString(36).slice(2, 9);
  const msg: Message = { id, text, userId, createdAt: Date.now() };
  messages.update((cur) => [...cur, msg]);
  return msg;
}

export function removeMessage(id: string) {
  messages.update((cur) => cur.filter((m) => m.id !== id));
}

export function editMessage(id: string, text: string) {
  messages.update((cur) => cur.map((m) => (m.id === id ? { ...m, text } : m)));
}

export function addImageMessage(userId: string, imageDataUrl: string) {
  const id = Math.random().toString(36).slice(2, 9);
  const msg: Message = { id, text: '', userId, createdAt: Date.now(), type: 'image', image: imageDataUrl };
  messages.update((cur) => [...cur, msg]);
  return msg;
}

export function addUser(name: string, color: string) {
  const id = Math.random().toString(36).slice(2, 9);
  const user: User = { id, name, color };
  users.update((cur) => [...cur, user]);
  return user;
}

export function setUserAvatar(userId: string, avatar: string | null) {
  users.update((cur) => cur.map((u) => (u.id === userId ? { ...u, avatar } : u)));
}

export function updateUserName(userId: string, name: string) {
  users.update((cur) => cur.map((u) => (u.id === userId ? { ...u, name } : u)));
}

export function setUserColor(userId: string, color: string) {
  users.update((cur) => cur.map((u) => (u.id === userId ? { ...u, color } : u)));
}

export function removeUser(userId: string) {
  users.update((cur) => cur.filter((u) => u.id !== userId));
  messages.update((cur) => cur.filter((m) => m.userId !== userId));
  selectedUserIds.update((ids) => ids.filter((id) => id !== userId));
  const currentVal = get(currentUserId);
  if (userId === currentVal) {
    const remaining = get(users);
    if (remaining.length > 0) {
      currentUserId.set(remaining[0].id);
    }
  }
}

export function setWallpaper(dataUrl: string | null) {
  wallpaper.set(dataUrl);
}

export function setGroupName(name: string) {
  groupSettings.update((g) => ({ ...g, name }));
}

export function setGroupAvatar(avatar: string | null) {
  groupSettings.update((g) => ({ ...g, avatar }));
}

export function setPhoneTheme(theme: Partial<PhoneTheme>) {
  phoneTheme.update((t) => ({ ...t, ...theme }));
}


export function clearState() {
  users.set(defaults.users);
  messages.set(defaults.messages);
  currentUserId.set(defaults.currentUserId);
  selectedUserIds.set(defaults.selectedUserIds);
  wallpaper.set(defaults.wallpaper);
  groupSettings.set(defaults.groupSettings);
  phoneTheme.set(defaults.phoneTheme);
  if (isLocalStorageAvailable) {
    localStorage.removeItem(LS_KEY);
  }
}

export default {
  users,
  messages,
  currentUserId,
  selectedUserIds,
  wallpaper,
  groupSettings,
  phoneTheme,
  addMessage,
  removeMessage,
  editMessage,
  addUser,
  setUserAvatar,
  updateUserName,
  setWallpaper,
  setGroupName,
  setGroupAvatar,
  setPhoneTheme,
  clearState,
};
