import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatService } from '@/services/chat';
import { useAuthStore } from '@/services/auth';
import { Chat, ChatMessage } from '@shared/types';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreVertical, Phone, Video, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialClientId = searchParams.get('clientId');
  const currentUser = useAuthStore(s => s.user);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);
  // Handle initial client selection from URL
  useEffect(() => {
    if (initialClientId && chats.length > 0) {
      const chat = chats.find(c => c.clientId === initialClientId);
      if (chat) {
        setSelectedChatId(chat.id);
      } else {
        // If chat doesn't exist for this client, we might need to create one
        // For now, we'll just try to find it or ignore
        createChatIfNeeded(initialClientId);
      }
    } else if (!selectedChatId && chats.length > 0 && !initialClientId) {
      // Default to first chat if none selected
      setSelectedChatId(chats[0].id);
    }
  }, [initialClientId, chats]);
  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId]);
  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      const data = await chatService.getChats();
      setChats(data);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setIsLoadingChats(false);
    }
  };
  const createChatIfNeeded = async (clientId: string) => {
    try {
      const newChat = await chatService.createChatForClient(clientId);
      setChats(prev => [...prev, newChat]);
      setSelectedChatId(newChat.id);
    } catch (error) {
      console.error('Could not create chat for client', error);
    }
  };
  const loadMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await chatService.getMessages(chatId);
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };
  const handleSendMessage = async (text: string) => {
    if (!selectedChatId || !currentUser) return;
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      chatId: selectedChatId,
      userId: currentUser.id,
      text,
      ts: Date.now(),
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar
    };
    setMessages(prev => [...prev, optimisticMsg]);
    try {
      const sentMsg = await chatService.sendMessage(selectedChatId, text, currentUser.id);
      // Replace optimistic message
      setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m));
      // Update chat list preview
      setChats(prev => prev.map(c => {
        if (c.id === selectedChatId) {
          return { ...c, lastMessage: text, lastMessageTs: Date.now() };
        }
        return c;
      }));
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error('Failed to send message');
    }
  };
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedChat = chats.find(c => c.id === selectedChatId);
  return (
    <div className="h-[calc(100vh-100px)] flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Messages</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} New
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9 bg-white border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading chats...</span>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations found.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredChats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 items-start",
                    selectedChatId === chat.id && "bg-blue-50/50 hover:bg-blue-50/60"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.title}`} />
                      <AvatarFallback>{chat.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {chat.unreadCount ? (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                        {chat.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={cn("font-medium text-sm truncate", chat.unreadCount ? "text-gray-900 font-semibold" : "text-gray-700")}>
                        {chat.title}
                      </h3>
                      {chat.lastMessageTs && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(chat.lastMessageTs, { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <p className={cn("text-xs truncate", chat.unreadCount ? "text-gray-900 font-medium" : "text-muted-foreground")}>
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-gray-100">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.title}`} />
                  <AvatarFallback>{selectedChat.title.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChat.title}</h2>
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
            {/* Messages */}
            <ChatMessages 
              messages={messages} 
              currentUserId={currentUser?.id || ''} 
              isLoading={isLoadingMessages}
            />
            {/* Input */}
            <ChatInput onSend={handleSendMessage} disabled={isLoadingMessages} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-gray-50/30">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">Select a conversation</p>
            <p className="text-sm max-w-xs text-center mt-2">
              Choose a client from the sidebar to start messaging or view chat history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}