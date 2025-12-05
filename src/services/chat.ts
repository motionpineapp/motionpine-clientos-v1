import { Chat, ChatMessage } from '@shared/types';
import { api } from '@/lib/api-client';

type MessageHandler = (message: ChatMessage) => void;
type ConnectionHandler = () => void;
type TypingHandler = (data: { userId: string; userName: string; isTyping: boolean }) => void;

class ChatService {
    private ws: WebSocket | null = null;
    private messageHandlers: Set<MessageHandler> = new Set();
    private connectionHandlers: Set<ConnectionHandler> = new Set();
    private disconnectionHandlers: Set<ConnectionHandler> = new Set();
    private typingHandlers: Set<TypingHandler> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000;
    private currentChatId: string | null = null;
    private currentUserId: string | null = null;
    private currentUserName: string | null = null;

    // REST API Methods (for fetching history)
    async getChats(): Promise<{ items: Chat[] }> {
        return api<{ items: Chat[] }>('/api/chats');
    }

    async getChatByClientId(clientId: string): Promise<Chat> {
        return api<Chat>(`/api/chats/client/${clientId}`);
    }

    async getMessages(chatId: string): Promise<ChatMessage[]> {
        return api<ChatMessage[]>(`/api/chats/${chatId}/messages`);
    }

    async createChatForClient(clientId: string): Promise<Chat> {
        return api<Chat>('/api/chats', {
            method: 'POST',
            body: JSON.stringify({ clientId }),
        });
    }

    // WebSocket Methods (for real-time)
    connect(chatId: string, userId: string, userName: string): void {
        // Don't reconnect if already connected to the same chat
        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentChatId === chatId) {
            return;
        }

        // Close existing connection first
        this.disconnect();

        this.currentChatId = chatId;
        this.currentUserId = userId;
        this.currentUserName = userName;

        const apiUrl = import.meta.env.VITE_API_URL || '';
        let protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let host = window.location.host;

        if (apiUrl) {
            try {
                const url = new URL(apiUrl);
                protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                host = url.host;
            } catch (e) {
                console.warn('[ChatService] Invalid VITE_API_URL, falling back to window.location');
            }
        }

        const wsUrl = `${protocol}//${host}/api/chats/${chatId}/websocket?userId=${encodeURIComponent(userId)}&userName=${encodeURIComponent(userName)}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('[ChatService] WebSocket connected');
            this.reconnectAttempts = 0;
            this.connectionHandlers.forEach(handler => handler());
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Handle different message types
                switch (data.type) {
                    case 'connected':
                        console.log('[ChatService] Connection confirmed:', data);
                        break;

                    case 'message':
                        // Broadcast to all message handlers
                        this.messageHandlers.forEach(handler => handler(data));
                        break;

                    case 'typing':
                        // Broadcast to typing handlers
                        this.typingHandlers.forEach(handler => handler(data));
                        break;

                    case 'user_joined':
                    case 'user_left':
                        console.log('[ChatService] User presence:', data);
                        break;

                    default:
                        console.warn('[ChatService] Unknown message type:', data.type);
                }
            } catch (error) {
                console.error('[ChatService] Failed to parse message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('[ChatService] WebSocket error:', error);
        };

        this.ws.onclose = () => {
            console.log('[ChatService] WebSocket closed');
            this.disconnectionHandlers.forEach(handler => handler());

            // Attempt to reconnect if not explicitly disconnected
            if (this.currentChatId && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`[ChatService] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                setTimeout(() => {
                    if (this.currentChatId && this.currentUserId && this.currentUserName) {
                        this.connect(this.currentChatId, this.currentUserId, this.currentUserName);
                    }
                }, this.reconnectDelay * this.reconnectAttempts);
            }
        };
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.currentChatId = null;
        this.currentUserId = null;
        this.currentUserName = null;
        this.reconnectAttempts = 0;
    }

    async sendMessage(chatId: string, text: string, userId: string): Promise<ChatMessage> {
        return api<ChatMessage>(`/api/chats/${chatId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ text, userId }),
        });
    }

    sendTypingIndicator(isTyping: boolean): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        this.ws.send(JSON.stringify({
            type: 'typing',
            isTyping
        }));
    }

    // Event Listeners
    onMessage(handler: MessageHandler): () => void {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    onTyping(handler: TypingHandler): () => void {
        this.typingHandlers.add(handler);
        return () => this.typingHandlers.delete(handler);
    }

    onConnect(handler: ConnectionHandler): () => void {
        this.connectionHandlers.add(handler);
        return () => this.connectionHandlers.delete(handler);
    }

    onDisconnect(handler: ConnectionHandler): () => void {
        this.disconnectionHandlers.add(handler);
        return () => this.disconnectionHandlers.delete(handler);
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    getCurrentUserId(): string | null {
        return this.currentUserId;
    }
}

export const chatService = new ChatService();
