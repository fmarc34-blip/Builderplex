export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'chat' | 'code' | '3d' | 'package-request' | 'text';
  code?: string;
  language?: string;
  packages?: string[];
  error?: string;
  responded?: boolean;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  packagesHandled?: boolean;
};

export type Project = {
  id: string;
  name: string;
  code: string;
  language: string;
  createdAt: number;
};

export type AppMode = 'chat' | 'coding' | 'self-coding' | 'projects';
export type InputMode = 'cursor' | 'touch' | 'tablet';

export interface AppState {
  credits: number;
  ageVerified: boolean;
  lastRefresh: number;
  userAge?: number;
  rememberMe: boolean;
  onboardingComplete: boolean;
}
