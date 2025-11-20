import React, { useEffect, useState, useCallback } from 'react';
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
  const initChat = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // Try to find existing chat
      const userChat = await chatService.getChatByClientId(currentUser.id);
      setChat(userChat);
      if (userChat) {
        const msgs = await chatService.getMessages(userChat.id);
        setMessages(msgs);
      }
    } catch (error) {
      // If chat not found, create one
      if (error instanceof Error && error.message.includes('not found')) {
        try {
          const newChat = await chatService.createChatForClient(currentUser.id);
          setChat(newChat);
          setMessages([]); // New chat has no messages
        } catch (createError) {
          console.error('Chat creation failed', createError);
          toast.error('Failed to create a support chat');
        }
      } else {
        console.error('Chat initialization failed', error);
        toast.error('Failed to connect to support chat');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);
  useEffect(() => {
    initChat();
  }, [initChat]);
  const handleSendMessage = async (text: string) => {
    if (!chat || !currentUser) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      chatId: chat.id,
      userId: currentUser.id,
      text,
      ts: Date.now(),
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar
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
      <div className="h-[calc(100vh-100px)] flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Connecting to support...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-gray-100">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">Admin Support</h2>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Messages Area */}
      <ChatMessages
        messages={messages}
        currentUserId={currentUser?.id || ''}
        isLoading={false}
      />
      {/* Input Area */}
      <ChatInput onSend={handleSendMessage} disabled={isSending} />
    </div>
  );
}