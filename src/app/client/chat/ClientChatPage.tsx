import React, { useEffect, useState, useCallback, useRef } from 'react';
import { chatService } from '@/services/chat';
import { useAuthStore } from '@/services/auth';
import { Chat, ChatMessage } from '@shared/types';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, Video, Info, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

export function ClientChatPage() {
  const currentUser = useAuthStore(s => s.user);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const msgs = await chatService.getMessages(chatId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  const initChat = useCallback(async () => {
    if (!currentUser?.id) {
      toast.error('User session missing. Please log in again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userChat = await chatService.getChatByClientId(currentUser.id);
      setChat(userChat);
      if (userChat) {
        await loadMessages(userChat.id);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        try {
          const newChat = await chatService.createChatForClient(currentUser.id);
          setChat(newChat);
          setMessages([]);
        } catch (createError) {
          console.warn('Client chat creation failed:', createError);
          toast.error('Failed to create a support chat. Please try refreshing.');
        }
      } else {
        console.error('Chat initialization failed', error);
        toast.error('Failed to connect to support chat');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, loadMessages]);

  useEffect(() => {
    initChat();
  }, [initChat]);

  // Connect to WebSocket when chat is loaded
  useEffect(() => {
    if (chat && currentUser) {
      // ① Register handlers FIRST (before connect)
      const unsubscribeConnect = chatService.onConnect(() => {
        console.log('[Chat] WebSocket connected, syncing messages...');
        loadMessages(chat.id);
      });

      const unsubscribeMessage = chatService.onMessage((msg) => {
        // Skip own messages - we already added them via optimistic update
        if (msg.userId === currentUser.id) return;

        setMessages(prev => {
          // Check by ID
          if (prev.some(m => m.id === msg.id)) return prev;
          // Check by nonce (bulletproof deduplication)
          if (msg.nonce && prev.some(m => m.nonce === msg.nonce)) return prev;
          // Fallback: text+timestamp check
          if (prev.some(m => m.text === msg.text && Math.abs(m.ts - msg.ts) < 2000)) return prev;
          return [...prev, msg];
        });
      });

      const unsubscribeTyping = chatService.onTyping(({ userName, isTyping }) => {
        if (isTyping) {
          setTypingUser(userName);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
          }, 3000);
        } else {
          setTypingUser(null);
        }
      });

      // ② THEN connect (handlers are ready now)
      console.log('[Chat] Connecting to chat:', chat.id);
      chatService.connect(chat.id, currentUser.id, currentUser.name);

      return () => {
        unsubscribeConnect();
        unsubscribeMessage();
        unsubscribeTyping();
        clearTimeout(typingTimeoutRef.current);
        chatService.disconnect();
      };
    }
  }, [chat, currentUser, loadMessages]);

  const handleSendMessage = async (text: string) => {
    if (!chat || !currentUser) return;

    const tempId = `temp-${Date.now()}`;
    const nonce = crypto.randomUUID();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      chatId: chat.id,
      userId: currentUser.id,
      text,
      ts: Date.now(),
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      nonce
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setIsSending(true);

    try {
      const sentMsg = await chatService.sendMessage(chat.id, text, currentUser.id);
      setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m));
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="h-[calc(100vh-180px)] flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Connecting to support...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="h-[calc(100vh-180px)] flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-gray-100">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900">Admin Support</h2>
              <div className="flex items-center gap-1.5">
                {typingUser ? (
                  <span className="text-xs text-primary animate-pulse">{typingUser} is typing...</span>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Online</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary"><Phone className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary"><Video className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary"><Info className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>

        <ChatMessages
          messages={messages}
          currentUserId={currentUser?.id || ''}
          isLoading={false}
        />
        <ChatInput onSend={handleSendMessage} disabled={isSending} />
      </div>
    </div>
  );
}