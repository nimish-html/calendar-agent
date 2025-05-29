# Product Requirements Document: Google Calendar AI Assistant

## Table of Contents
1. [Product Overview](#product-overview)
2. [Technical Architecture](#technical-architecture)
3. [Feature Requirements](#feature-requirements)
4. [Implementation Steps](#implementation-steps)
5. [File Structure](#file-structure)
6. [API Documentation](#api-documentation)
7. [Edge Cases and Error Handling](#edge-cases-and-error-handling)
8. [Testing Strategy](#testing-strategy)

## Product Overview

### Objective
Build an AI-powered Google Calendar assistant that helps users manage their calendar events, improve productivity, and automate scheduling tasks through a conversational interface.

### Core Value Proposition
- Intelligent calendar analysis and productivity insights
- Natural language calendar management
- Automated meeting scheduling with confirmation workflows
- Seamless integration with existing Google Calendar setup

### Target Users
- Professionals managing busy schedules
- Anyone looking to optimize their time management
- Users who prefer conversational interfaces for calendar management

## Technical Architecture

### Technology Stack
- **Frontend**: Next.js 14+ with TypeScript
- **UI Components**: shadcn/ui
- **AI Integration**: OpenAI Responses API
- **Calendar Integration**: Zapier MCP Server
- **Styling**: Tailwind CSS

### Data Flow
```
User Input → Chatbot Interface → OpenAI Responses API → Zapier MCP → Google Calendar
                     ↓
User Confirmation ← UI Components ← Calendar Actions
```

## Feature Requirements

### Core Features

#### 1. Conversational Interface
- **Requirement**: Real-time chat interface for user interactions
- **Components**: Chat messages, input field, typing indicators
- **Behavior**: Support for text input, message history, and response streaming

#### 2. Calendar Reading (No Confirmation Required)
- **Requirement**: Fetch and display calendar information
- **Actions**: 
  - View upcoming events
  - Check availability
  - Analyze schedule patterns
  - Generate productivity insights

#### 3. Calendar Modifications (Confirmation Required)
- **Requirement**: Modify calendar events with user approval
- **Actions**:
  - Create new events
  - Edit existing events
  - Delete events
  - Reschedule meetings
- **Confirmation Flow**: Show preview → User accepts/rejects → Execute action

#### 4. Productivity Analysis
- **Requirement**: AI-powered insights on calendar usage
- **Features**:
  - Meeting frequency analysis
  - Time block suggestions
  - Optimization recommendations
  - Work-life balance insights

## Implementation Steps

### Phase 1: Project Setup and Basic Infrastructure - Done

#### Step 1.1: Initialize Next.js Project - Done
```bash
npx create-next-app@latest calendar-assistant --typescript --tailwind --eslint
cd calendar-assistant
npm install lucide-react class-variance-authority clsx tailwind-merge
```

#### Step 1.2: Install shadcn/ui - Done
```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea card scroll-area avatar badge
```

#### Step 1.3: Environment Setup - Done
Create `.env.local`:
```env
OPENAI_API_KEY=sk-...
ZAPIER_MCP_URL=https://mcp.zapier.com/api/mcp/mcp
ZAPIER_MCP_API_KEY=your_zapier_mcp_key
```

### Phase 2: Core Chat Interface

#### Step 2.1: Create Chat Components
- Message bubble components
- Chat input component
- Chat container with scroll
- Typing indicator

#### Step 2.2: OpenAI Integration
- API route for handling chat requests
- Streaming response handler
- Error handling and retries

### Phase 3: Calendar Integration

#### Step 3.1: Zapier MCP Integration
- Tool configuration for calendar operations
- Request/response handling
- Error mapping and user feedback

#### Step 3.2: Confirmation System
- Confirmation modal component
- Action preview display
- Accept/reject workflow

### Phase 4: Advanced Features

#### Step 4.1: Productivity Analysis
- Calendar data processing
- Insight generation algorithms
- Visualization components

#### Step 4.2: Polish and Testing
- Error boundaries
- Loading states
- Accessibility improvements
- Performance optimization

## File Structure

```
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── .env.local
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── chat
│   │   │   │   └── route.ts
│   │   │   └── calendar
│   │   │       ├── confirm
│   │   │       │   └── route.ts
│   │   │       └── execute
│   │   │           └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── badge.tsx
│   │   ├── chat
│   │   │   ├── chat-container.tsx
│   │   │   ├── chat-message.tsx
│   │   │   ├── chat-input.tsx
│   │   │   ├── typing-indicator.tsx
│   │   │   └── message-list.tsx
│   │   ├── calendar
│   │   │   ├── confirmation-modal.tsx
│   │   │   ├── event-preview.tsx
│   │   │   └── productivity-insights.tsx
│   │   └── layout
│   │       ├── header.tsx
│   │       └── sidebar.tsx
│   ├── lib
│   │   ├── utils.ts
│   │   ├── openai.ts
│   │   ├── zapier-mcp.ts
│   │   └── types.ts
│   ├── hooks
│   │   ├── use-chat.ts
│   │   ├── use-calendar.ts
│   │   └── use-confirmation.ts
│   └── store
│       ├── chat-store.ts
│       └── calendar-store.ts
└── tsconfig.json
```

## API Documentation

### Chat API Route (`/api/chat`)

#### Endpoint: `POST /api/chat`

**Request Body:**
```typescript
interface ChatRequest {
  message: string;
  conversationId?: string;
  previousResponseId?: string;
}
```

**Response:**
```typescript
interface ChatResponse {
  id: string;
  message: string;
  requiresConfirmation?: boolean;
  calendarAction?: CalendarAction;
  error?: string;
}

interface CalendarAction {
  type: 'create' | 'edit' | 'delete' | 'reschedule';
  event: EventDetails;
  confirmationId: string;
}
```

**Implementation:**
```typescript
// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAIClient } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, previousResponseId } = await request.json();
    
    const openai = new OpenAIClient();
    const response = await openai.createResponse({
      model: "gpt-4.1",
      input: message,
      previous_response_id: previousResponseId,
      tools: [{
        type: "mcp",
        server_label: "zapier",
        server_url: process.env.ZAPIER_MCP_URL,
        require_approval: "never",
        headers: {
          "Authorization": `Bearer ${process.env.ZAPIER_MCP_API_KEY}`
        }
      }],
      instructions: `You are a helpful Google Calendar assistant. 
        - For reading calendar information, respond directly with the information.
        - For calendar modifications (create, edit, delete events), always indicate that confirmation is required.
        - Provide clear, concise responses about calendar management and productivity.
        - When suggesting calendar changes, explain the benefits clearly.`
    });

    // Process response and determine if confirmation is needed
    const requiresConfirmation = detectCalendarModification(response);
    
    return NextResponse.json({
      id: response.id,
      message: extractMessageContent(response),
      requiresConfirmation,
      calendarAction: requiresConfirmation ? extractCalendarAction(response) : undefined
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
```

### Calendar Confirmation API (`/api/calendar/confirm`)

#### Endpoint: `POST /api/calendar/confirm`

**Request Body:**
```typescript
interface ConfirmationRequest {
  confirmationId: string;
  action: 'accept' | 'reject';
  calendarAction: CalendarAction;
}
```

**Implementation:**
```typescript
// src/app/api/calendar/confirm/route.ts
export async function POST(request: NextRequest) {
  try {
    const { confirmationId, action, calendarAction } = await request.json();
    
    if (action === 'reject') {
      return NextResponse.json({ 
        success: true, 
        message: 'Calendar action cancelled' 
      });
    }
    
    // Execute the calendar action via Zapier MCP
    const result = await executeCalendarAction(calendarAction);
    
    return NextResponse.json({
      success: true,
      message: 'Calendar action completed successfully',
      result
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute calendar action' },
      { status: 500 }
    );
  }
}
```

## Component Implementation

### Chat Container Component

```typescript
// src/components/chat/chat-container.tsx
'use client';

import { useState } from 'react';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ConfirmationModal } from '../calendar/confirmation-modal';
import { useChat } from '@/hooks/use-chat';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ChatContainer() {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    pendingConfirmation,
    confirmAction,
    rejectAction 
  } = useChat();

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>
      
      <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      
      {pendingConfirmation && (
        <ConfirmationModal
          action={pendingConfirmation}
          onConfirm={confirmAction}
          onReject={rejectAction}
        />
      )}
    </div>
  );
}
```

### Confirmation Modal Component

```typescript
// src/components/calendar/confirmation-modal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarAction } from '@/lib/types';
import { EventPreview } from './event-preview';

interface ConfirmationModalProps {
  action: CalendarAction;
  onConfirm: () => void;
  onReject: () => void;
}

export function ConfirmationModal({ 
  action, 
  onConfirm, 
  onReject 
}: ConfirmationModalProps) {
  const getActionDescription = () => {
    switch (action.type) {
      case 'create':
        return 'Create this new calendar event?';
      case 'edit':
        return 'Update this calendar event?';
      case 'delete':
        return 'Delete this calendar event?';
      case 'reschedule':
        return 'Reschedule this calendar event?';
      default:
        return 'Confirm this calendar action?';
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onReject()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Calendar Action</DialogTitle>
          <DialogDescription>
            {getActionDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <EventPreview event={action.event} actionType={action.type} />
        
        <DialogFooter>
          <Button variant="outline" onClick={onReject}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Chat Hook Implementation

```typescript
// src/hooks/use-chat.ts
'use client';

import { useState, useCallback } from 'react';
import { ChatMessage, CalendarAction } from '@/lib/types';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<CalendarAction | null>(null);
  const [conversationId] = useState(() => crypto.randomUUID());

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId,
          previousResponseId: messages[messages.length - 1]?.responseId,
        }),
      });

      const data = await response.json();
      
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
      if (data.requiresConfirmation) {
        setPendingConfirmation(data.calendarAction);
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
        error: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, messages]);

  const confirmAction = useCallback(async () => {
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
      }
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setPendingConfirmation(null);
    }
  }, [pendingConfirmation]);

  const rejectAction = useCallback(() => {
    setPendingConfirmation(null);
    
    const rejectionMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Calendar action cancelled.',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, rejectionMessage]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    pendingConfirmation,
    confirmAction,
    rejectAction,
  };
}
```

## Edge Cases and Error Handling

### 1. Network Connectivity Issues
```typescript
// Retry logic for API calls
const retryApiCall = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 2. OpenAI API Rate Limits
```typescript
// Rate limit handling
const handleRateLimit = (error: any) => {
  if (error.status === 429) {
    return 'I'm experiencing high demand right now. Please try again in a moment.';
  }
  return 'Sorry, I encountered an error. Please try again.';
};
```

### 3. Invalid Calendar Operations
```typescript
// Validation for calendar actions
const validateCalendarAction = (action: CalendarAction): string[] => {
  const errors: string[] = [];
  
  if (!action.event.title?.trim()) {
    errors.push('Event title is required');
  }
  
  if (!action.event.startTime || !action.event.endTime) {
    errors.push('Start and end times are required');
  }
  
  if (new Date(action.event.startTime) >= new Date(action.event.endTime)) {
    errors.push('End time must be after start time');
  }
  
  return errors;
};
```

### 4. Zapier MCP Connection Issues
```typescript
// Health check for MCP server
const checkMCPHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.ZAPIER_MCP_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
```

### 5. User Session Management
```typescript
// Session timeout handling
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const isSessionValid = (lastActivity: Date): boolean => {
  return Date.now() - lastActivity.getTime() < SESSION_TIMEOUT;
};
```

## Type Definitions

```typescript
// src/lib/types.ts
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  responseId?: string;
  error?: boolean;
}

export interface CalendarAction {
  type: 'create' | 'edit' | 'delete' | 'reschedule';
  event: EventDetails;
  confirmationId: string;
}

export interface EventDetails {
  id?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  recurrence?: RecurrenceRule;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  until?: string;
  count?: number;
}

export interface ProductivityInsight {
  type: 'meeting_load' | 'focus_time' | 'schedule_gaps' | 'work_balance';
  title: string;
  description: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}
```

## Testing Strategy

### Unit Tests
- Component rendering tests
- Hook functionality tests
- Utility function tests
- API route tests

### Integration Tests
- Chat flow end-to-end
- Calendar action confirmation flow
- Error handling scenarios

### Example Test File
```typescript
// __tests__/hooks/use-chat.test.ts
import { renderHook, act } from '@testing-library/react';
import { useChat } from '@/hooks/use-chat';

describe('useChat', () => {
  it('should send message and update messages', async () => {
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    expect(result.current.messages).toHaveLength(2); // user + assistant
    expect(result.current.messages[0].content).toBe('Hello');
    expect(result.current.messages[0].role).toBe('user');
  });
});
```

## Deployment Configuration

### Environment Variables
```env
# .env.production
OPENAI_API_KEY=sk-prod-...
ZAPIER_MCP_URL=https://mcp.zapier.com/api/mcp/mcp
ZAPIER_MCP_API_KEY=prod_zapier_key
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### Next.js Configuration
```typescript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
```

This comprehensive PRD provides a complete roadmap for building the Google Calendar AI Assistant with all necessary components, error handling, and implementation details. The modular structure ensures maintainability and scalability while the detailed specifications enable clear development execution.