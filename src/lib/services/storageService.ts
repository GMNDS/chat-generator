/**
 * Serviço de persistência com debounce para otimizar escritas no localStorage
 */
import type { AppState } from '../types';
import { isValidAppState } from '../utils/validation';
import { handleError } from '../utils/errorHandler';

const LS_KEY = 'chat-generator-state-v2';
const DEBOUNCE_MS = 300; // Delay de 300ms antes de salvar

// Verificar se localStorage está disponível
const isLocalStorageAvailable = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingState: AppState | null = null;

/**
 * Valida o estado antes de salvar
 * @deprecated Use isValidAppState de validation.ts
 */
function validateState(state: unknown): state is AppState {
  return isValidAppState(state);
}

/**
 * Carrega o estado do localStorage
 */
export function loadState(): AppState | null {
  try {
    if (!isLocalStorageAvailable) return null;
    
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw);
    
    if (!validateState(parsed)) {
      handleError(new Error('Estado inválido no localStorage'), {
        action: 'loadState',
        data: { raw },
      });
      return null;
    }
    
    return parsed;
  } catch (e) {
    handleError(e, { action: 'loadState' });
    return null;
  }
}

/**
 * Salva o estado imediatamente (sem debounce)
 * Útil para operações críticas como limpar estado
 */
function saveStateImmediate(state: AppState): void {
  try {
    if (!isLocalStorageAvailable) return;
    
    if (!validateState(state)) {
      handleError(new Error('Tentativa de salvar estado inválido'), {
        action: 'saveStateImmediate',
        data: { state },
      });
      return;
    }
    
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    handleError(e, { action: 'saveStateImmediate', data: { state } });
    
    // Tentar recuperar: se o localStorage está cheio, tentar limpar dados antigos
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      try {
        // Remove apenas a chave atual se possível
        localStorage.removeItem(LS_KEY);
        localStorage.setItem(LS_KEY, JSON.stringify(state));
      } catch (recoveryError) {
        handleError(recoveryError, {
          action: 'saveStateImmediate',
          data: { recovery: true, state },
        });
      }
    }
  }
}

/**
 * Salva o estado com debounce para evitar múltiplas escritas
 */
export function saveState(state: AppState): void {
  pendingState = state;
  
  // Limpar timeout anterior se existir
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Criar novo timeout
  saveTimeout = setTimeout(() => {
    if (pendingState) {
      saveStateImmediate(pendingState);
      pendingState = null;
    }
    saveTimeout = null;
  }, DEBOUNCE_MS);
}

/**
 * Força o salvamento imediato de qualquer estado pendente
 * Útil antes de fechar a aplicação ou em operações críticas
 */
export function flushPendingSave(): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  
  if (pendingState) {
    saveStateImmediate(pendingState);
    pendingState = null;
  }
}

/**
 * Remove o estado do localStorage
 */
export function clearStorage(): void {
  try {
    if (!isLocalStorageAvailable) return;
    localStorage.removeItem(LS_KEY);
  } catch (e) {
    handleError(e, { action: 'clearStorage' });
  }
}

