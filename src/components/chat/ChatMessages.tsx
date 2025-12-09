import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@shared/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface ChatMessagesProps {
  messages: ChatMessage[];
  currentUserId: string;
  isLoading?: boolean;
}
export function ChatMessages({ messages, currentUserId, isLoading }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        No messages yet. Start the conversation!
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
      {messages.map((msg, index) => {
        const isMe = msg.userId === currentUserId;
        const showAvatar = !isMe && (index === 0 || messages[index - 1].userId !== msg.userId);
        return (
          <div
            key={msg.id}
            className={cn(
              "flex w-full gap-3",
              isMe ? "justify-end" : "justify-start"
            )}
          >
            {!isMe && (
              <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                {showAvatar ? (
                  <Avatar className="h-8 w-8 border border-gray-100">
                    <AvatarImage src={msg.senderAvatar} />
                    <AvatarFallback>{msg.senderName?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                ) : <div className="w-8" />}
              </div>
            )}
            <div className={cn(
              "flex flex-col max-w-[75%]",
              isMe ? "items-end" : "items-start"
            )}>
              {!isMe && showAvatar && (
                <span className="text-xs text-muted-foreground mb-1 ml-1">
                  {msg.senderName}
                </span>
              )}
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-white border border-gray-100 text-gray-900 rounded-tl-none"
                )}
              >
                {msg.text}
              </div>
              <span className={cn(
                "text-[10px] text-muted-foreground mt-1",
                isMe ? "mr-1" : "ml-1"
              )}>
                {format(new Date(msg.ts), 'h:mm a')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}