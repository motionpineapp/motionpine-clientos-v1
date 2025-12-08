import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, Image as ImageIcon, Smile } from 'lucide-react';
import { toast } from 'sonner';
import { chatService } from '@/services/chat';

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      // Send typing=false on unmount
      chatService.sendTypingIndicator(false);
    };
  }, []);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    // Clear typing indicator before sending
    clearTimeout(typingTimeoutRef.current);
    chatService.sendTypingIndicator(false);

    try {
      setIsSending(true);
      await onSend(message);
      setMessage('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;

    // Send typing indicator (debounced)
    if (value.trim()) {
      chatService.sendTypingIndicator(true);

      // Clear previous timeout
      clearTimeout(typingTimeoutRef.current);

      // Stop typing after 1.5 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTypingIndicator(false);
      }, 1500);
    } else {
      // If empty, stop typing
      clearTimeout(typingTimeoutRef.current);
      chatService.sendTypingIndicator(false);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <div className="flex gap-1 pb-1 pl-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full" disabled={disabled}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full" disabled={disabled}>
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[40px] max-h-[120px] py-2.5 bg-transparent border-none focus-visible:ring-0 resize-none shadow-none"
          disabled={disabled || isSending}
          rows={1}
        />
        <div className="pb-1 pr-1">
          <Button
            size="icon"
            className="h-8 w-8 rounded-full transition-all"
            onClick={handleSend}
            disabled={!message.trim() || disabled || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift + Enter for new line
      </div>
    </div>
  );
}