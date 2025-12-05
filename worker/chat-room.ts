import { DurableObject } from 'cloudflare:workers';
import * as db from './db';
import { ChatMessage } from '@shared/types';

export interface ChatRoomEnv {
    DB: D1Database;
}

interface Session {
    webSocket: WebSocket;
    userId: string;
    userName: string;
}

/**
 * ChatRoom Durable Object
 * Manages WebSocket connections for a single chat room and broadcasts messages in real-time
 */
export class ChatRoom extends DurableObject<ChatRoomEnv> {
    private sessions: Set<Session> = new Set();
    private chatId: string;

    constructor(ctx: DurableObjectState, env: ChatRoomEnv) {
        super(ctx, env);
        // Extract chatId from the Durable Object ID name
        this.chatId = ctx.id.name || 'unknown';
    }

    async fetch(request: Request): Promise<Response> {
        // Handle WebSocket upgrade
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
            // Check if this is an internal RPC call (e.g. broadcast from API)
            // We can use a custom header or path to distinguish
            const url = new URL(request.url);
            if (url.pathname === '/broadcast') {
                return this.handleBroadcast(request);
            }
            return new Response('Expected WebSocket', { status: 426 });
        }

        // Get user info from query params
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const userName = url.searchParams.get('userName');

        if (!userId || !userName) {
            return new Response('Missing userId or userName', { status: 400 });
        }

        // Create WebSocket pair
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        // Accept the WebSocket connection
        this.ctx.acceptWebSocket(server);

        // Store session info
        const session: Session = {
            webSocket: server,
            userId,
            userName
        };
        this.sessions.add(session);

        // Send connection confirmation
        server.send(JSON.stringify({
            type: 'connected',
            chatId: this.chatId,
            userId
        }));

        // Broadcast to others that user joined
        this.broadcast({
            type: 'user_joined',
            userId,
            userName,
            timestamp: Date.now()
        }, session);

        return new Response(null, {
            status: 101,
            webSocket: client
        });
    }

    // RPC method to handle broadcast from API
    async handleBroadcast(request: Request): Promise<Response> {
        try {
            const body = await request.json<{ excludeUserId?: string;[key: string]: any }>();
            const { excludeUserId, ...message } = body;

            // Find session to exclude (if sender specified)
            let excludeSession: Session | undefined;
            if (excludeUserId) {
                excludeSession = Array.from(this.sessions).find(s => s.userId === excludeUserId);
            }

            this.broadcast(message, excludeSession);
            return new Response('OK', { status: 200 });
        } catch (error) {
            return new Response('Error broadcasting', { status: 500 });
        }
    }

    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
        try {
            // Find the session for this WebSocket
            const session = Array.from(this.sessions).find(s => s.webSocket === ws);
            if (!session) {
                console.error('Session not found for WebSocket');
                return;
            }

            // Parse the message
            const data = typeof message === 'string' ? JSON.parse(message) : null;
            if (!data) {
                console.error('Invalid message format');
                return;
            }

            // Handle different message types
            switch (data.type) {
                case 'message': {
                    // Create message object
                    const chatMessage: ChatMessage = {
                        id: crypto.randomUUID(),
                        chatId: this.chatId,
                        userId: session.userId,
                        text: data.text,
                        ts: Date.now(),
                        senderName: session.userName,
                        senderAvatar: undefined // We don't have avatar in session currently
                    };

                    // Persist to DB
                    await db.createChatMessage(this.env.DB, chatMessage);

                    // Update chat last message
                    await db.updateChat(this.env.DB, this.chatId, {
                        lastMessage: chatMessage.text,
                        lastMessageTs: chatMessage.ts
                    });

                    // Broadcast the message to all connected clients (except sender - they use optimistic update)
                    this.broadcast({
                        type: 'message',
                        ...chatMessage
                    }, session);
                    break;
                }

                case 'typing':
                    // Broadcast typing indicator (don't send to self)
                    this.broadcast({
                        type: 'typing',
                        userId: session.userId,
                        userName: session.userName,
                        isTyping: data.isTyping
                    }, session);
                    break;

                default:
                    console.warn('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    }

    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
        // Find and remove the session
        const session = Array.from(this.sessions).find(s => s.webSocket === ws);
        if (session) {
            this.sessions.delete(session);

            // Broadcast to others that user left
            this.broadcast({
                type: 'user_left',
                userId: session.userId,
                userName: session.userName,
                timestamp: Date.now()
            });
        }

        // Close the WebSocket
        ws.close(code, reason);
    }

    async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
        console.error('WebSocket error:', error);
        // Clean up the session
        const session = Array.from(this.sessions).find(s => s.webSocket === ws);
        if (session) {
            this.sessions.delete(session);
        }
    }

    /**
     * Broadcast a message to all connected clients
     * @param message The message to broadcast
     * @param exclude Optional session to exclude from broadcast (e.g., sender)
     */
    private broadcast(message: any, exclude?: Session): void {
        const serialized = JSON.stringify(message);
        this.sessions.forEach(session => {
            if (session !== exclude) {
                try {
                    session.webSocket.send(serialized);
                } catch (error) {
                    console.error('Error sending to WebSocket:', error);
                    // Remove dead connections
                    this.sessions.delete(session);
                }
            }
        });
    }

    /**
     * Get the number of active connections
     */
    getActiveConnections(): number {
        return this.sessions.size;
    }
}
