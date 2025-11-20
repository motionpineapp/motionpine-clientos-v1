import { Chat, ChatMessage } from '@shared/types';
import { api } from '@/lib/api-client';
export const chatService = {
  getChats: async (): Promise<{ items: Chat[] }> => {
    return api('/api/chats');
  },
  getChatByClientId: async (clientId: string): Promise<Chat> => {
    return api(`/api/chats/client/${clientId}`);
  },
  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    return api(`/api/chats/${chatId}/messages`);
  },
  sendMessage: async (chatId: string, text: string, userId: string): Promise<ChatMessage> => {
    return api(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, userId }),
    });
  },
  createChatForClient: async (clientId: string): Promise<Chat> => {
    return api('/api/chats/for-client', {
      method: 'POST',
      body: JSON.stringify({ clientId }),
    });
  },
};