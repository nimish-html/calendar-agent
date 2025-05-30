'use client';

import { useState } from 'react';
import { ChatMessage, CalendarAction } from '@/lib/types';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { Card } from '@/components/ui/card';

// Mock confirmation modal for now - will be implemented in Phase 3
function MockConfirmationModal({ 
  action, 
  onConfirm, 
  onReject 
}: { 
  action: CalendarAction; 
  onConfirm: () => void; 
  onReject: () => void; 
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-6 max-w-md mx-4 shadow-2xl border-0">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Confirm Calendar Action</h3>
        <p className="text-gray-600 mb-4">
          {action.type === 'create' && 'Create this new calendar event?'}
          {action.type === 'edit' && 'Update this calendar event?'}
          {action.type === 'delete' && 'Delete this calendar event?'}
          {action.type === 'reschedule' && 'Reschedule this calendar event?'}
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-gray-900">{action.event.title}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(action.event.startTime).toLocaleString()} - {new Date(action.event.endTime).toLocaleString()}
          </p>
          {action.event.location && (
            <p className="text-sm text-gray-600 mt-1">📍 {action.event.location}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onReject}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </Card>
    </div>
  );
}

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<CalendarAction | null>(null);
  const [conversationId] = useState(() => crypto.randomUUID());

  const sendMessage = async (content: string, confirmed?: boolean, confirmationId?: string) => {
    console.log('sendMessage called with:', { content, confirmed, confirmationId });
    setIsLoading(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    console.log('User message added, calling API...');

    try {
      const currentDate = new Date().toISOString();
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId,
          previousResponseId: messages.length > 0 ? messages[messages.length - 1].responseId : undefined,
          confirmed: confirmed,
          confirmationId: confirmationId,
          currentDate: currentDate,
          userTimezone: userTimezone
        }),
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        responseId: data.id,
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Handle confirmation if needed
      if (data.requiresConfirmation && data.calendarAction) {
        console.log('Setting pending confirmation:', data.calendarAction);
        setPendingConfirmation(data.calendarAction);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        error: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAction = async () => {
    if (!pendingConfirmation) return;

    try {
      const response = await fetch('/api/calendar/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationId: pendingConfirmation.confirmationId,
          action: 'accept',
          calendarAction: pendingConfirmation,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const confirmationMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, confirmationMessage]);
      } else {
        throw new Error(data.error || 'Failed to execute calendar action');
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, there was an error executing the calendar action. Please try again.',
        timestamp: new Date(),
        error: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setPendingConfirmation(null);
    }
  };

  const rejectAction = () => {
    setPendingConfirmation(null);
    
    const rejectionMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Calendar action cancelled. Is there anything else I can help you with?',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, rejectionMessage]);
  };

  return (
    <div className="h-full flex flex-col">
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput 
        onSendMessage={sendMessage} 
        disabled={isLoading || !!pendingConfirmation}
        pendingConfirmationId={pendingConfirmation?.confirmationId}
      />
      
      {pendingConfirmation && (
        <MockConfirmationModal
          action={pendingConfirmation}
          onConfirm={confirmAction}
          onReject={rejectAction}
        />
      )}
    </div>
  );
} 