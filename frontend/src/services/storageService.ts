// services/storageService.ts
import { Conversation } from "../types";

const STORAGE_KEY = "aether_conversations";

export const storageService = {
  getConversations(): Conversation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveConversations(conversations: Conversation[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  },
};
