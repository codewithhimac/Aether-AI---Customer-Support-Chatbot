
export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  status?: 'sending' | 'error' | 'success';
}

export interface Conversation {
  id: string;
  title: string;
  lastUpdated: number;
  messages: Message[];
}

export interface AppState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
}

export interface ChatConfig {
  model: string;
  temperature: number;
  systemPrompt: string;
}
