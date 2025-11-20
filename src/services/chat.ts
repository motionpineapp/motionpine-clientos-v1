import { Chat, ChatMessage } from '@shared/types';
import { MOCK_CHATS, MOCK_MESSAGES } from './mock-data';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const chatService = {
  getChats: async (): Promise<Chat[]> => {
    await delay(300);
    return Promise.resolve(MOCK_CHATS);
  },
  getChatByClientId: async (clientId: string): Promise<Chat | undefined> => {
    await delay(200);
    return Promise.resolve(MOCK_CHATS.find(c => c.clientId === clientId));
  },
  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    await delay(400);
    return Promise.resolve(MOCK_MESSAGES.filter(m => m.chatId === chatId));
  },
  sendMessage: async (chatId: string, text: string, userId: string): Promise<ChatMessage> => {
    await delay(500);
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatId,
      userId,
      text,
      ts: Date.now(),
      senderName: userId === 'admin-1' ? 'Admin' : 'Client',
    };
    // Note: This won't persist in the mock data across reloads.
    return Promise.resolve(newMessage);
  },
  createChatForClient: async (clientId: string): Promise<Chat> => {
    await delay(300);
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      clientId,
      title: `Client ${clientId}`,
      lastMessage: 'Chat created',
      lastMessageTs: Date.now(),
      unreadCount: 0,
    };
    return Promise.resolve(newChat);
  },
};