import { Chat, ChatMessage } from '@shared/types';
import { api } from '@/lib/api-client';
import { clientService } from './clients';
export const chatService = {
  getChats: async (): Promise<Chat[]> => {
    return api<Chat[]>('/api/chats');
  },
  getChatByClientId: async (clientId: string): Promise<Chat | undefined> => {
    const chats = await api<Chat[]>('/api/chats');
    return chats.find(c => c.clientId === clientId);
  },
  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    return api<ChatMessage[]>(`/api/chats/${chatId}/messages`);
  },
  sendMessage: async (chatId: string, text: string, userId: string): Promise<ChatMessage> => {
    return api<ChatMessage>(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ userId, text })
    });
  },
  createChatForClient: async (clientId: string): Promise<Chat> => {
    const client = await clientService.getClient(clientId);
    if (!client) throw new Error('Client not found');
    return api<Chat>('/api/chats', {
      method: 'POST',
      body: JSON.stringify({
        title: client.name,
        clientId: client.id,
        lastMessage: 'Chat started',
        lastMessageTs: Date.now(),
        unreadCount: 0
      })
    });
  }
};