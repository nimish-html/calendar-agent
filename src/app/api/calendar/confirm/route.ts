import { NextRequest, NextResponse } from 'next/server';
import { zapierMCP, validateCalendarAction } from '@/lib/zapier-mcp';
import { CalendarAction } from '@/lib/types';
import { sanitizeErrorMessage } from '@/lib/error-handling';

interface ConfirmationRequest {
  confirmationId: string;
  action: 'accept' | 'reject';
  calendarAction: CalendarAction;
}

async function executeCalendarAction(calendarAction: CalendarAction) {
  try {
    // Validate the calendar action before execution
    const validationErrors = validateCalendarAction(calendarAction);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Execute the action via Zapier MCP
    const mcpResponse = await zapierMCP.executeCalendarAction(calendarAction);
    
    if (!mcpResponse.success) {
      throw new Error(mcpResponse.error || 'Calendar action failed');
    }
    
    const { type, event } = calendarAction;
    
    // Format success response based on action type
    switch (type) {
      case 'create':
        return {
          success: true,
          event_id: mcpResponse.data?.id || `event_${Date.now()}`,
          message: `Successfully created event "${event.title}"`,
          data: mcpResponse.data
        };
      case 'edit':
        return {
          success: true,
          event_id: event.id,
          message: `Successfully updated event "${event.title}"`,
          data: mcpResponse.data
        };
      case 'delete':
        return {
          success: true,
          event_id: event.id,
          message: `Successfully deleted event "${event.title}"`,
          data: mcpResponse.data
        };
      case 'reschedule':
        return {
          success: true,
          event_id: event.id,
          message: `Successfully rescheduled event "${event.title}"`,
          data: mcpResponse.data
        };
      default:
        throw new Error(`Unknown calendar action type: ${type}`);
    }
  } catch (error) {
    console.error('Calendar action execution error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ConfirmationRequest;
    const { confirmationId, action, calendarAction } = body;
    
    if (!confirmationId || !action || !calendarAction) {
      return NextResponse.json(
        { error: 'Missing required fields: confirmationId, action, and calendarAction' },
        { status: 400 }
      );
    }
    
    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be either "accept" or "reject"' },
        { status: 400 }
      );
    }
    
    if (action === 'reject') {
      return NextResponse.json({ 
        success: true, 
        message: 'Calendar action cancelled',
        action: 'rejected'
      });
    }
    
    // Check MCP server health before executing action
    const mcpHealthy = await zapierMCP.checkHealth();
    if (!mcpHealthy) {
      return NextResponse.json(
        { error: 'Calendar service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    // Execute the calendar action via Zapier MCP
    const result = await executeCalendarAction(calendarAction);
    
    return NextResponse.json({
      success: true,
      message: result.message,
      result: {
        event_id: result.event_id,
        action: calendarAction.type,
        event: calendarAction.event,
        calendar_data: result.data
      }
    });
    
  } catch (error) {
    console.error('Calendar confirmation API error:', error);
    
    if (error instanceof Error) {
      // Handle specific validation errors
      if (error.message.includes('Validation failed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Handle calendar service errors
      if (error.message.includes('authorization') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Calendar access authorization failed. Please check your Google Calendar permissions.' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('permissions') || error.message.includes('forbidden')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to access this calendar.' },
          { status: 403 }
        );
      }
      
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'The requested calendar event could not be found.' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('conflict') || error.message.includes('busy')) {
        return NextResponse.json(
          { error: 'There is a scheduling conflict with this time slot.' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

// Health check endpoint that also checks MCP connectivity
export async function GET() {
  try {
    const mcpHealthy = await zapierMCP.checkHealth();
    
    return NextResponse.json({
      status: mcpHealthy ? 'ok' : 'degraded',
      service: 'calendar-confirmation',
      mcp_status: mcpHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      service: 'calendar-confirmation',
      mcp_status: 'error',
      error: sanitizeErrorMessage(error),
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
} 