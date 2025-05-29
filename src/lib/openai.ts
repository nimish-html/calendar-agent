import OpenAI from 'openai';
import { retryApiCall, sanitizeErrorMessage } from './error-handling';
import { getMCPToolConfig, MCPTool } from './zapier-mcp';

export class OpenAIClient {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createResponse(params: {
    model: string;
    input: string;
    previous_response_id?: string;
    instructions: string;
  }) {
    return retryApiCall(async () => {
      try {
        const instructions = params.instructions +
          '\n\nImportant: \n' +
          '- For calendar modifications (create, edit, delete, reschedule), ALWAYS indicate that user confirmation is required before executing the action.\n' +
          '- For calendar reading operations, provide the information directly.\n' +
          '- When suggesting calendar changes, be specific about what will be created/modified and ask for confirmation.\n' +
          '- Use natural language to describe calendar operations clearly.\n' +
          '- For calendar event creation/updates passed to tools:\n' +
          '  - **Reminders:** ALWAYS instruct the tool to use default reminders. This typically means setting a field like `reminders__useDefault` to `true`. Parameters for specific reminder methods (e.g., `reminders_methods`) and times (e.g., `reminders_minutes`) MUST NOT be provided when using default reminders.\n' +
          '  - **Date Validity:** Ensure event start and end dates are logical (e.g., end time is after start time) and are typically in the future. If the user specifies a relative date (e.g., "tomorrow", "next Monday"), calculate the absolute date and time. If the user\'s date/time intent is for the past or is unclear, ask for explicit confirmation or clarification before proceeding with the tool call.\n' +
          '  - Provide all other relevant details (summary, location, attendees, description, conferencing, visibility, transparency, recurrence, etc.) to the tool, based on user input.\n';

        const mcpTool = getMCPToolConfig();
        const toolsForAPI = mcpTool ? [mcpTool] : [];

        const response = await this.client.responses.create({
          model: params.model,
          input: params.input,
          instructions: instructions,
          tools: toolsForAPI,
          ...(params.previous_response_id && { previous_response_id: params.previous_response_id }),
        }) as any;

        return {
          id: response.id,
          content: response.output_text || this.extractContentFromOutput(response.output) || '',
          tool_calls: response.output?.filter((item: any) => item.type === 'mcp_call') || [],
          finish_reason: response.status || 'completed'
        };
      } catch (error: any) {
        console.error('OpenAI Responses API error:', error);
        
        if (error?.status === 429) throw new Error('rate limit');
        if (error?.status === 401) throw new Error('API key invalid');
        if (error?.status === 503) throw new Error('OpenAI service unavailable');
        
        throw new Error(sanitizeErrorMessage(error));
      }
    }, 3, 1000);
  }

  async createStreamingResponse(params: {
    model: string;
    input: string;
    previous_response_id?: string;
    instructions: string;
  }) {
    return retryApiCall(async () => {
      try {
        const instructions = params.instructions +
          '\n\nImportant: \n' +
          '- For calendar modifications, ALWAYS indicate that user confirmation is required.\n' +
          '- For calendar reading, provide information directly.\n' +
          '- Be specific about calendar changes and ask for confirmation.\n' +
          '- For calendar event creation/updates passed to tools:\n' +
          '  - **Reminders:** ALWAYS instruct the tool to use default reminders. This typically means setting a field like `reminders__useDefault` to `true`. Parameters for specific reminder methods (e.g., `reminders_methods`) and times (e.g., `reminders_minutes`) MUST NOT be provided when using default reminders.\n' +
          '  - **Date Validity:** Ensure event start and end dates are logical (e.g., end time is after start time) and are typically in the future. If the user specifies a relative date (e.g., "tomorrow", "next Monday"), calculate the absolute date and time. If the user\'s date/time intent is for the past or is unclear, ask for explicit confirmation or clarification before proceeding with the tool call.\n' +
          '  - Provide all other relevant details (summary, location, attendees, description, conferencing, visibility, transparency, recurrence, etc.) to the tool, based on user input.\n';

        const mcpTool = getMCPToolConfig();
        const toolsForAPI = mcpTool ? [mcpTool] : [];

        const stream = await this.client.responses.create({
          model: params.model,
          input: params.input,
          instructions: instructions,
          tools: toolsForAPI,
          ...(params.previous_response_id && { previous_response_id: params.previous_response_id }),
          stream: true,
        }) as any;

        return stream;
      } catch (error: any) {
        console.error('OpenAI streaming Responses API error:', error);
        
        if (error?.status === 429) throw new Error('rate limit');
        if (error?.status === 401) throw new Error('API key invalid');
        
        throw new Error(sanitizeErrorMessage(error));
      }
    }, 2, 1000);
  }

  private extractContentFromOutput(output: any): string {
    if (!output) return '';
    if (typeof output === 'string') return output;

    if (Array.isArray(output)) {
      return output
        .filter((item: any) => item.type === 'message' && item.content)
        .flatMap((item: any) => item.content)
        .filter((contentItem: any) => contentItem.type === 'output_text')
        .map((contentItem: any) => contentItem.text)
        .join(' \n');
    }
    return '';
  }
}

export function detectCalendarModification(response: any): boolean {
  if (response.tool_calls && Array.isArray(response.tool_calls) && response.tool_calls.length > 0) {
    return response.tool_calls.some((call: any) => {
      if (call.type === 'mcp_call' && !call.error) {
        const toolName = call.name?.toLowerCase() || '';
        return toolName.includes('create') || 
               toolName.includes('update') || 
               toolName.includes('delete') || 
               toolName.includes('add');
      }
      return false;
    });
  }
  
  const content = response.content || '';
  const contentStr = typeof content === 'string' ? content.toLowerCase() : '';
  const modificationKeywords = [
    'create event', 'schedule meeting', 'add to calendar',
    'delete event', 'cancel meeting', 'remove from calendar',
    'reschedule', 'move meeting', 'change time',
    'edit event', 'update meeting', 'modify event',
    'i can create', 'i can schedule', 'i can add',
    'would you like me to', 'shall i create', 'shall i schedule',
    'i\'ll create', 'i\'ll schedule', 'i\'ll add'
  ];
  
  return modificationKeywords.some(keyword => contentStr.includes(keyword));
}

export function extractMessageContent(response: any): string {
  if (response.content) {
    return response.content;
  }
  if (response.output_text) {
    return response.output_text;
  }
  if (response.output && Array.isArray(response.output)) {
    return response.output
      .filter((item: any) => item.type === 'message' && item.content)
      .flatMap((item: any) => item.content)
      .filter((contentItem: any) => contentItem.type === 'output_text')
      .map((contentItem: any) => contentItem.text)
      .join(' \n');
  }
  return 'I can help you with your calendar. What would you like to do?';
}

export function extractCalendarAction(response: any): any {
  if (response.tool_calls && Array.isArray(response.tool_calls) && response.tool_calls.length > 0) {
    const mcpCall = response.tool_calls.find((call: any) => 
      call.type === 'mcp_call' && !call.error && call.output
    );
    
    if (mcpCall && mcpCall.output && mcpCall.output.results) {
      try {
        const toolArgs = typeof mcpCall.arguments === 'string' ? JSON.parse(mcpCall.arguments) : mcpCall.arguments;
        const toolOutput = typeof mcpCall.output === 'string' ? JSON.parse(mcpCall.output) : mcpCall.output;

        let eventDetails = {
          title: toolArgs?.summary || toolArgs?.text || 'Calendar Event',
          startTime: toolArgs?.start__dateTime || toolOutput?.start?.dateTime || new Date().toISOString(),
          endTime: toolArgs?.end__dateTime || toolOutput?.end?.dateTime || new Date(Date.now() + 60*60*1000).toISOString(),
          id: toolOutput?.id,
        };

        return {
          type: mcpCall.name?.includes('create') ? 'create' : 
                mcpCall.name?.includes('update') ? 'edit' : 
                mcpCall.name?.includes('delete') ? 'delete' : 'action',
          event: eventDetails,
          confirmationId: crypto.randomUUID(),
          rawToolCall: mcpCall
        };
      } catch (error) {
        console.error('Error parsing MCP calendar action from tool_calls:', error);
        return null;
      }
    }
  }
  return null;
} 