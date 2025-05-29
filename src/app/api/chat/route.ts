import { NextRequest, NextResponse } from 'next/server';
import { OpenAIClient, detectCalendarModification, extractMessageContent, extractCalendarAction } from '@/lib/openai';
import { handleRateLimit, sanitizeErrorMessage } from '@/lib/error-handling';
import { getMCPToolConfig } from '@/lib/zapier-mcp';

export async function POST(request: NextRequest) {
  try {
    const { message, previousResponseId } = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // MCP health check is no longer strictly needed here as OpenAI handles tool availability.
    // We can still log if the config is missing for debugging.
    const mcpToolConfig = getMCPToolConfig();
    if (!mcpToolConfig) {
      console.warn('Zapier MCP configuration is missing. Calendar tools will be unavailable.');
    }

    const openai = new OpenAIClient();
    const response = await openai.createResponse({
      model: "gpt-4o",
      input: message,
      previous_response_id: previousResponseId,
      // The OpenAIClient will internally use getMCPToolConfig
      instructions: `You are a helpful Google Calendar assistant. 
        - For reading calendar information (checking availability, viewing events, analyzing schedules), respond directly with the information.
        - For calendar modifications (create, edit, delete, reschedule events), always indicate that confirmation is required by using phrases like "I can help you create this event" or "I can schedule this meeting for you" and include the event details.
        - Provide clear, concise responses about calendar management and productivity.
        - When suggesting calendar changes, explain the benefits clearly.
        - Always be helpful and professional.
        - If you need to perform calendar actions, use the calendar_action function with appropriate parameters.
        
        Examples of responses that require confirmation:
        - "I can create a meeting titled 'Team Standup' for tomorrow at 9 AM. Would you like me to add this to your calendar?"
        - "I can schedule your 'Doctor Appointment' for Friday at 2 PM. Shall I create this event?"
        
        Examples of responses that don't require confirmation:
        - "You have 3 meetings scheduled for today: Team Standup at 9 AM, Project Review at 2 PM, and Client Call at 4 PM."
        - "Your calendar shows you're free from 10 AM to 12 PM tomorrow."
        `
    });

    const requiresConfirmation = detectCalendarModification(response);
    const messageContent = extractMessageContent(response);
    const calendarAction = requiresConfirmation ? extractCalendarAction(response) : undefined;
    
    return NextResponse.json({
      id: response.id,
      message: messageContent,
      requiresConfirmation,
      calendarAction
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: handleRateLimit(error) }, // handleRateLimit might be defined elsewhere
          { status: 429 }
        );
      }
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API configuration error' },
          { status: 500 }
        );
      }
      // ZAPIER_MCP_API_KEY error check might be less relevant now if config issues are caught earlier
    }
    
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const message = searchParams.get('message');
  const previousResponseId = searchParams.get('previousResponseId');
  
  if (!message?.trim()) {
    return NextResponse.json(
      { error: 'Message is required' },
      { status: 400 }
    );
  }

  try {
    const mcpToolConfig = getMCPToolConfig();
    if (!mcpToolConfig) {
      console.warn('Zapier MCP configuration is missing for streaming. Calendar tools will be unavailable.');
    }
    
    const openai = new OpenAIClient();
    const stream = await openai.createStreamingResponse({
      model: "gpt-4o",
      input: message,
      previous_response_id: previousResponseId || undefined,
      instructions: `You are a helpful Google Calendar assistant. 
        - For reading calendar information, respond directly with the information.
        - For calendar modifications, always indicate that confirmation is required.
        - Provide clear, concise responses about calendar management and productivity.
        - When suggesting calendar changes, explain the benefits clearly.
        - Always be helpful and professional.`
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // The structure of stream chunks for Responses API might differ from Chat Completions.
            // This part needs to be adapted to the actual chunk structure.
            // Assuming chunk is the raw event from the stream:
            let content = '';
            if (chunk.type === 'response_delta' && chunk.response_delta?.output_text_delta?.text) {
              content = chunk.response_delta.output_text_delta.text;
            } else if (chunk.type === 'output_text_delta' && chunk.output_text_delta?.text) {
              content = chunk.output_text_delta.text; // More direct path based on some SDKs
            } else if (chunk.choices && chunk.choices[0]?.delta?.content) {
               content = chunk.choices[0]?.delta?.content; // Fallback for Chat Completions like structure
            }

            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: sanitizeErrorMessage(error) 
          })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Streaming API error:', error);
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
} 