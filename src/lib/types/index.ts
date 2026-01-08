/**
 * Tipos TypeScript para o Chat Generator
 */

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
  type?: 'text' | 'image';
  image?: string | null;
};

export type GroupSettings = {
  name: string;
  avatar?: string | null;
};

export type PhoneTheme = {
  frameColor1: string;
  frameColor2: string;
  screenBgColor: string;
  screenBgImage?: string | null;
  frameGradientAngle: number;
  displayTime?: string; // Hora exibida no header (formato HH:MM)
};

export type AppState = {
  users: User[];
  messages: Message[];
  currentUserId: string;
  selectedUserIds: string[];
  wallpaper: string | null;
  groupSettings: GroupSettings;
  phoneTheme: PhoneTheme;
};

