'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { ChatMessage } from './chat-message';
import { TypingIndicator } from './typing-indicator';
import { Sparkles, Calendar, Clock, Users } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto overscroll-behavior-contain"
      style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: '#e5e7eb transparent'
      }}
    >
      <div className="p-6 space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-2xl mx-auto">
              
              {/* Welcome Animation */}
              <div className="mb-8 relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome to your AI Calendar Assistant!
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                I'm here to help you manage your calendar effortlessly. You can ask me to schedule meetings, 
                check your availability, reschedule events, or get insights about your productivity patterns.
              </p>

              {/* Quick Start Examples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Schedule & View</span>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• "What's on my calendar today?"</li>
                    <li>• "Schedule a meeting with Sarah tomorrow at 2 PM"</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">Find Time</span>
                  </div>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• "Find a free 1-hour slot this week"</li>
                    <li>• "When am I available for a call?"</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-4 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Team Coordination</span>
                  </div>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• "Schedule a team standup every Monday"</li>
                    <li>• "Move the project review to next week"</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-900">Insights</span>
                  </div>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• "Show me my meeting patterns"</li>
                    <li>• "How much free time do I have this week?"</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                💡 Tip: You can speak naturally - I understand context and follow-up questions!
              </p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
} 