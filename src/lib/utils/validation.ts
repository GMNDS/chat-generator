/**
 * Validadores reutilizáveis para dados da aplicação
 */
import type { User, Message, AppState } from '../types';

/**
 * Valida se uma string não está vazia após trim
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida se é um ID válido (string não vazia)
 */
export function isValidId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Valida se é uma cor hexadecimal válida
 */
export function isValidHexColor(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}

/**
 * Valida um objeto User
 */
export function isValidUser(user: unknown): user is User {
  if (!user || typeof user !== 'object') return false;
  const u = user as Record<string, unknown>;
  return (
    isValidId(u.id) &&
    isNonEmptyString(u.name) &&
    isValidHexColor(u.color) &&
    (u.avatar === null || u.avatar === undefined || typeof u.avatar === 'string')
  );
}

/**
 * Valida um array de Users
 */
export function isValidUsersArray(users: unknown): users is User[] {
  if (!Array.isArray(users)) return false;
  return users.every(isValidUser);
}

/**
 * Verifica se o texto contém apenas emojis (1 a 3 emojis, sem texto adicional)
 * Usado para aplicar tamanho maior aos emojis, como no WhatsApp
 */
export function isEmojiOnly(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  // Remove espaços em branco
  const trimmed = text.trim();
  
  // Regex para detectar emojis (incluindo variações com skin tone e emojis compostos)
  // \p{Emoji} detecta caracteres emoji, mas precisa considerar sequências ZWJ
  const emojiRegex = /^(?:[\p{Emoji}\u200d]+\uFE0F?){1,3}$/u;
  
  return emojiRegex.test(trimmed);
}

/**
 * Valida um objeto Message
 */
export function isValidMessage(message: unknown): message is Message {
  if (!message || typeof message !== 'object') return false;
  const m = message as Record<string, unknown>;
  return (
    isValidId(m.id) &&
    typeof m.text === 'string' &&
    isValidId(m.userId) &&
    typeof m.createdAt === 'number' &&
    (m.type === undefined || m.type === 'text' || m.type === 'image') &&
    (m.image === null || m.image === undefined || typeof m.image === 'string')
  );
}

/**
 * Valida um array de Messages
 */
export function isValidMessagesArray(messages: unknown): messages is Message[] {
  if (!Array.isArray(messages)) return false;
  return messages.every(isValidMessage);
}

/**
 * Valida o estado completo da aplicação
 */
export function isValidAppState(state: unknown): state is AppState {
  if (!state || typeof state !== 'object') return false;
  const s = state as Record<string, unknown>;
  
  return (
    isValidUsersArray(s.users) &&
    isValidMessagesArray(s.messages) &&
    isValidId(s.currentUserId) &&
    Array.isArray(s.selectedUserIds) &&
    s.selectedUserIds.every(isValidId) &&
    (s.wallpaper === null || typeof s.wallpaper === 'string') &&
    typeof s.groupSettings === 'object' &&
    s.groupSettings !== null &&
    typeof (s.groupSettings as Record<string, unknown>).name === 'string' &&
    typeof s.phoneTheme === 'object' &&
    s.phoneTheme !== null
  );
}

