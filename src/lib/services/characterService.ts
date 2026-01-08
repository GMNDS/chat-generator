/**
 * Serviço de lógica de negócio para personagens
 */
import { addUser, setUserAvatar, updateUserName, setUserColor, removeUser } from '../stores';
import { isNonEmptyString, isValidHexColor } from '../utils/validation';
import { handleError, createError } from '../utils/errorHandler';
import type { User } from '../types';

/**
 * Cria um novo personagem com validação
 */
export function createCharacter(name: string, color: string): User | null {
  if (!isNonEmptyString(name)) {
    handleError(createError('Nome do personagem não pode estar vazio'), {
      action: 'createCharacter',
      data: { name, color },
    });
    return null;
  }

  if (!isValidHexColor(color)) {
    handleError(createError('Cor inválida'), {
      action: 'createCharacter',
      data: { name, color },
    });
    return null;
  }

  try {
    return addUser(name.trim(), color);
  } catch (error) {
    handleError(error, {
      action: 'createCharacter',
      data: { name, color },
    });
    return null;
  }
}

/**
 * Atualiza o nome de um personagem com validação
 */
export function updateCharacterName(userId: string, name: string): boolean {
  if (!isNonEmptyString(name)) {
    handleError(createError('Nome do personagem não pode estar vazio'), {
      action: 'updateCharacterName',
      data: { userId, name },
    });
    return false;
  }

  try {
    updateUserName(userId, name.trim());
    return true;
  } catch (error) {
    handleError(error, {
      action: 'updateCharacterName',
      data: { userId, name },
    });
    return false;
  }
}

/**
 * Atualiza a cor de um personagem com validação
 */
export function updateCharacterColor(userId: string, color: string): boolean {
  if (!isValidHexColor(color)) {
    handleError(createError('Cor inválida'), {
      action: 'updateCharacterColor',
      data: { userId, color },
    });
    return false;
  }

  try {
    setUserColor(userId, color);
    return true;
  } catch (error) {
    handleError(error, {
      action: 'updateCharacterColor',
      data: { userId, color },
    });
    return false;
  }
}

/**
 * Atualiza o avatar de um personagem
 */
export function updateCharacterAvatar(userId: string, avatar: string | null): void {
  try {
    setUserAvatar(userId, avatar);
  } catch (error) {
    handleError(error, {
      action: 'updateCharacterAvatar',
      data: { userId },
    });
  }
}

/**
 * Remove um personagem
 */
export function deleteCharacter(userId: string): boolean {
  try {
    removeUser(userId);
    return true;
  } catch (error) {
    handleError(error, {
      action: 'deleteCharacter',
      data: { userId },
    });
    return false;
  }
}

