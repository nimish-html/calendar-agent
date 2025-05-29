'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    console.log('handleSend called:', { trimmedMessage, disabled });
    if (trimmedMessage && !disabled) {
      console.log('Sending message:', trimmedMessage);
      onSendMessage(trimmedMessage);
      setMessage('');
    } else {
      console.log('Message not sent:', { isEmpty: !trimmedMessage, disabled });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Quick Suggestions */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          <button 
            className="flex-shrink-0 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            onClick={() => setMessage("What's on my calendar today?")}
            disabled={disabled}
          >
            📅 Today's schedule
          </button>
          <button 
            className="flex-shrink-0 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            onClick={() => setMessage("Find a free 1-hour slot this week")}
            disabled={disabled}
          >
            🔍 Find free time
          </button>
          <button 
            className="flex-shrink-0 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            onClick={() => setMessage("Schedule a team meeting")}
            disabled={disabled}
          >
            ➕ New meeting
          </button>
        </div>

        {/* Input Area */}
        <div className="relative">
          <div className="flex gap-3 items-end">
            
            {/* Additional Actions */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-500 hover:text-gray-700"
                disabled={disabled}
              >
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-500 hover:text-gray-700"
                disabled={disabled}
              >
                <Mic className="h-4 w-4" />
                <span className="sr-only">Voice input</span>
              </Button>
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about your calendar, schedule meetings, or get productivity insights..."
                className="min-h-[50px] max-h-[120px] resize-none pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={disabled}
              />
              
              {/* Character Count */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {message.length}/1000
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              className="h-[50px] w-12 shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>

          {/* Help Text */}
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="hidden sm:block">Powered by AI • Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  );
} 