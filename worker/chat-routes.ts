import { Hono } from 'hono';
import { Env } from './core-utils';
import * as db from './db';
import { Chat, ChatMessage } from '@shared/types';

export const chatRoutes = (app: Hono<{ Bindings: Env }>) => {

    // GET /api/chats - List all chats (Admin)
    app.get('/api/chats', async (c) => {
        try {
            const chats = await db.listChats(c.env.DB);
            return c.json({ success: true, items: chats });
        } catch (error) {
            console.error('Failed to list chats:', error);
            return c.json({ success: false, error: 'Failed to list chats' }, 500);
        }
    });

    // GET /api/chats/client/:clientId - Get chat by client ID
    app.get('/api/chats/client/:clientId', async (c) => {
        const { clientId } = c.req.param();
        try {
            const chat = await db.getChatByClientId(c.env.DB, clientId);
            if (!chat) {
                return c.json({ success: false, error: 'Chat not found' }, 404);
            }
            return c.json(chat);
        } catch (error) {
            console.error('Failed to get chat:', error);
            return c.json({ success: false, error: 'Failed to get chat' }, 500);
        }
    });

    // POST /api/chats - Create a new chat
    app.post('/api/chats', async (c) => {
        try {
            const body = await c.req.json<{ clientId: string }>();
            if (!body.clientId) {
                return c.json({ success: false, error: 'Client ID is required' }, 400);
            }

            // Check if chat already exists
            const existing = await db.getChatByClientId(c.env.DB, body.clientId);
            if (existing) {
                return c.json(existing);
            }

            // Get client details for the title
            const client = await db.getClientById(c.env.DB, body.clientId);
            if (!client) {
                return c.json({ success: false, error: 'Client not found' }, 404);
            }

            const newChat: Chat = {
                id: crypto.randomUUID(),
                clientId: body.clientId,
                title: client.name || client.company || 'Support Chat',
                lastMessage: null,
                lastMessageTs: Date.now(),
                unreadCount: 0
            };

            const created = await db.createChat(c.env.DB, newChat);
            return c.json(created, 201);
        } catch (error) {
            console.error('Failed to create chat:', error);
            return c.json({ success: false, error: 'Failed to create chat' }, 500);
        }
    });

    // GET /api/chats/:chatId/messages - Get messages for a chat
    app.get('/api/chats/:chatId/messages', async (c) => {
        const { chatId } = c.req.param();
        try {
            const messages = await db.getChatMessages(c.env.DB, chatId);
            return c.json(messages);
        } catch (error) {
            console.error('Failed to get messages:', error);
            return c.json({ success: false, error: 'Failed to get messages' }, 500);
        }
    });

    // POST /api/chats/:chatId/messages - Send a message
    app.post('/api/chats/:chatId/messages', async (c) => {
        const { chatId } = c.req.param();
        try {
            const body = await c.req.json<{ text: string; userId: string }>();
            if (!body.text || !body.userId) {
                return c.json({ success: false, error: 'Text and User ID are required' }, 400);
            }

            // Get sender details
            const sender = await db.getUserByEmail(c.env.DB, body.userId); // ID is email in this system
            // Fallback if sender is not a user (e.g. system message), though unlikely in this flow
            const senderName = sender?.name || 'Unknown';
            const senderAvatar = sender?.avatar || null;

            const newMessage: ChatMessage = {
                id: crypto.randomUUID(),
                chatId,
                userId: body.userId,
                text: body.text,
                ts: Date.now(),
                senderName,
                senderAvatar
            };

            const created = await db.createChatMessage(c.env.DB, newMessage);

            // Update chat last message
            await db.updateChat(c.env.DB, chatId, {
                lastMessage: body.text,
                lastMessageTs: newMessage.ts,
                // Simple unread logic: if sender is admin, increment for client? 
                // For now, let's just update the timestamp and text. 
                // Real unread count logic requires knowing who is reading.
                // We'll skip complex unread logic for this MVP step.
            });

            return c.json(created, 201);
        } catch (error) {
            console.error('Failed to send message:', error);
            return c.json({ success: false, error: 'Failed to send message' }, 500);
        }
    });
};
