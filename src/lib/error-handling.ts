// Retry logic for API calls
export const retryApiCall = async <T>(
  fn: () => Promise<T>, 
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Maximum retries exceeded');
};

// Rate limit handling
export const handleRateLimit = (error: any): string => {
  if (error?.status === 429 || error?.message?.includes('rate limit')) {
    return 'I\'m experiencing high demand right now. Please try again in a moment.';
  }
  
  if (error?.status === 503 || error?.message?.includes('unavailable')) {
    return 'The service is temporarily unavailable. Please try again shortly.';
  }
  
  return 'Something went wrong. Please retry.';
};

// Validation for calendar actions
export const validateCalendarAction = (action: {
  type: string;
  event: {
    title?: string;
    start_time?: string;
    end_time?: string;
    [key: string]: any;
  };
}): string[] => {
  const errors: string[] = [];
  
  if (!action.event.title?.trim()) {
    errors.push('Event title is required');
  }
  
  if (action.type !== 'delete' && action.type !== 'read') {
    if (!action.event.start_time) {
      errors.push('Start time is required');
    }
    
    if (!action.event.end_time) {
      errors.push('End time is required');
    }
    
    if (action.event.start_time && action.event.end_time) {
      const startTime = new Date(action.event.start_time);
      const endTime = new Date(action.event.end_time);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        errors.push('Invalid date format for start or end time');
      } else if (startTime >= endTime) {
        errors.push('End time must be after start time');
      }
    }
  }
  
  return errors;
};

// Health check for external services
export const checkServiceHealth = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Session timeout handling
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const isSessionValid = (lastActivity: Date): boolean => {
  return Date.now() - lastActivity.getTime() < SESSION_TIMEOUT;
};

// Error message sanitization
export const sanitizeErrorMessage = (error: any): string => {
  // Never expose internal errors to users
  if (error?.message?.includes('API key') || error?.message?.includes('unauthorized')) {
    return 'Authentication error. Please check your configuration.';
  }
  
  if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error?.message?.includes('parse') || error?.message?.includes('invalid JSON')) {
    return 'Invalid request format. Please try again.';
  }
  
  // Generic fallback
  return 'Something went wrong. Please retry.';
};

// API response validation
export const validateApiResponse = (response: any, requiredFields: string[]): boolean => {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  return requiredFields.every(field => {
    const value = response[field];
    return value !== undefined && value !== null && value !== '';
  });
}; 