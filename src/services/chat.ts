import { Chat, ChatMessage } from '@shared/types';
import { clientService } from './clients';
// Mock Data
const MOCK_CHATS: Chat[] = [
  {
    id: 'chat-1',
    title: 'Alice Freeman',
    clientId: 'c1',
    lastMessage: 'Thanks for the update!',
    lastMessageTs: Date.now() - 1000 * 60 * 5, // 5 mins ago
    unreadCount: 2
  },
  {
    id: 'chat-2',
    title: 'Bob Smith',
    clientId: 'c2',
    lastMessage: 'When is the next meeting?',
    lastMessageTs: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    unreadCount: 0
  },
  {
    id: 'chat-3',
    title: 'Charlie Davis',
    clientId: 'c3',
    lastMessage: 'Invoice received.',
    lastMessageTs: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    unreadCount: 0
  }
];
const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'chat-1': [
    {
      id: 'm1',
      chatId: 'chat-1',
      userId: 'c1',
      text: 'Hi there, just checking on the project status.',
      ts: Date.now() - 1000 * 60 * 60,
      senderName: 'Alice Freeman',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
    },
    {
      id: 'm2',
      chatId: 'chat-1',
      userId: 'admin-1',
      text: 'Hello Alice! We are making great progress. I will send over a preview shortly.',
      ts: Date.now() - 1000 * 60 * 30,
      senderName: 'Admin User',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    },
    {
      id: 'm3',
      chatId: 'chat-1',
      userId: 'c1',
      text: 'Thanks for the update!',
      ts: Date.now() - 1000 * 60 * 5,
      senderName: 'Alice Freeman',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
    }
  ],
  'chat-2': [
    {
      id: 'm4',
      chatId: 'chat-2',
      userId: 'c2',
      text: 'When is the next meeting?',
      ts: Date.now() - 1000 * 60 * 60 * 2,
      senderName: 'Bob Smith',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    }
  ]
};
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const chatService = {
  getChats: async (): Promise<Chat[]> => {
    await delay(500);
    return [...MOCK_CHATS];
  },
  getChatByClientId: async (clientId: string): Promise<Chat | undefined> => {
    await delay(300);
    return MOCK_CHATS.find(c => c.clientId === clientId);
  },
  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    await delay(400);
    return MOCK_MESSAGES[chatId] || [];
  },
  sendMessage: async (chatId: string, text: string, userId: string): Promise<ChatMessage> => {
    await delay(300);
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      chatId,
      userId,
      text,
      ts: Date.now(),
      senderName: 'Admin User', // Mock
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    };
    if (!MOCK_MESSAGES[chatId]) {
      MOCK_MESSAGES[chatId] = [];
    }
    MOCK_MESSAGES[chatId].push(newMessage);
    // Update last message in chat list
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = text;
      chat.lastMessageTs = Date.now();
    }
    return newMessage;
  },
  // Helper to create a chat if it doesn't exist for a client
  createChatForClient: async (clientId: string): Promise<Chat> => {
    await delay(500);
    const client = await clientService.getClient(clientId);
    if (!client) throw new Error('Client not found');
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: client.name,
      clientId: client.id,
      lastMessage: 'Chat started',
      lastMessageTs: Date.now(),
      unreadCount: 0
    };
    MOCK_CHATS.push(newChat);
    MOCK_MESSAGES[newChat.id] = [];
    return newChat;
  }
};