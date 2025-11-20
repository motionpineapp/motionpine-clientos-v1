import { Chat, ChatMessage } from '@shared/types';
import { MOCK_CHATS, MOCK_MESSAGES } from './mock-data';
export const chatService = {
  getChats: async (): Promise<{ items: Chat[] }> => {
    return Promise.resolve({ items: MOCK_CHATS });
  },
  getChatByClientId: async (clientId: string): Promise<Chat> => {
    const chat = MOCK_CHATS.find(c => c.clientId === clientId);
    if (chat) {
      return Promise.resolve(chat);
    }
    return Promise.reject(new Error('Chat not found'));
  },
  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const messages = MOCK_MESSAGES.filter(m => m.chatId === chatId);
    return Promise.resolve(messages);
  },
  sendMessage: async (chatId: string, text: string, userId: string): Promise<ChatMessage> => {
    const newMessage: ChatMessage = {
      id: `m${MOCK_MESSAGES.length + 1}`,
      chatId,
      userId,
      text,
      ts: Date.now(),
    };
    // In a real mock, you'd push this to an array
    return Promise.resolve(newMessage);
  },
  createChatForClient: async (clientId: string): Promise<Chat> => {
    const newChat: Chat = {
      id: `chat-${clientId}`,
      clientId,
      title: `Client ${clientId}`,
      lastMessage: 'Chat created.',
      lastMessageTs: Date.now(),
      unreadCount: 0,
    };
    // In a real mock, you'd push this to an array
    return Promise.resolve(newChat);
  },
};