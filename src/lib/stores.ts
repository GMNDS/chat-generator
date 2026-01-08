/**
 * @deprecated Este arquivo mantém compatibilidade com código existente.
 * Use src/lib/stores/index.ts e src/lib/types/index.ts para novas funcionalidades.
 * 
 * Este arquivo será removido após migração completa dos componentes.
 */
export type {
  User,
  Message,
  GroupSettings,
  PhoneTheme,
} from './types';

// Re-exportar stores e funções do novo sistema
export {
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
  addImageMessage,
  addUser,
  setUserAvatar,
  updateUserName,
  setUserColor,
  removeUser,
  setWallpaper,
  setGroupName,
  setGroupAvatar,
  setPhoneTheme,
  setCurrentUserId,
  setSelectedUserIds,
  clearState,
} from './stores/index';
