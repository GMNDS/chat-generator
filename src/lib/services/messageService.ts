/**
 * Serviço de lógica de negócio para mensagens
 */
import { addMessage, editMessage, removeMessage, addImageMessage } from '../stores';
import { isNonEmptyString } from '../utils/validation';
import { handleError, createError } from '../utils/errorHandler';
import type { Message } from '../types';

/**
 * Cria uma nova mensagem de texto com validação
 */
export function createTextMessage(text: string, userId: string): Message | null {
  if (!isNonEmptyString(text)) {
    handleError(createError('Texto da mensagem não pode estar vazio'), {
      action: 'createTextMessage',
      data: { text, userId },
    });
    return null;
  }

  if (!userId) {
    handleError(createError('ID do usuário é obrigatório'), {
      action: 'createTextMessage',
      data: { text, userId },
    });
    return null;
  }

  try {
    return addMessage(text.trim(), userId);
  } catch (error) {
    handleError(error, {
      action: 'createTextMessage',
      data: { text, userId },
    });
    return null;
  }
}

/**
 * Atualiza uma mensagem existente com validação
 */
export function updateMessage(messageId: string, text: string): boolean {
  if (!isNonEmptyString(text)) {
    handleError(createError('Texto da mensagem não pode estar vazio'), {
      action: 'updateMessage',
      data: { messageId, text },
    });
    return false;
  }

  try {
    editMessage(messageId, text.trim());
    return true;
  } catch (error) {
    handleError(error, {
      action: 'updateMessage',
      data: { messageId, text },
    });
    return false;
  }
}

/**
 * Remove uma mensagem
 */
export function deleteMessage(messageId: string): boolean {
  try {
    removeMessage(messageId);
    return true;
  } catch (error) {
    handleError(error, {
      action: 'deleteMessage',
      data: { messageId },
    });
    return false;
  }
}

/**
 * Cria uma nova mensagem de imagem
 */
export function createImageMessage(userId: string, imageDataUrl: string): Message | null {
  if (!userId) {
    handleError(createError('ID do usuário é obrigatório'), {
      action: 'createImageMessage',
      data: { userId },
    });
    return null;
  }

  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    handleError(createError('URL da imagem inválida'), {
      action: 'createImageMessage',
      data: { userId },
    });
    return null;
  }

  try {
    return addImageMessage(userId, imageDataUrl);
  } catch (error) {
    handleError(error, {
      action: 'createImageMessage',
      data: { userId },
    });
    return null;
  }
}

