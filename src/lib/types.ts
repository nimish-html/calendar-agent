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