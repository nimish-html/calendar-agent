// Zapier MCP Integration for Google Calendar Operations

import { validateCalendarAction as validateCalendarActionFromErrorHandling } from './error-handling';

export interface MCPTool {
  type: 'mcp';
  server_label: string;
  server_url: string;
  require_approval?: 'never' | 'always' | null;
  headers: Record<string, string>;
  // It can also include an 'allowed_tools' field, but we'll keep it simple for now.
}

/**
 * Get MCP tool configuration for OpenAI
 */
export function getMCPToolConfig(): MCPTool | undefined {
  const apiKey = process.env.ZAPIER_MCP_API_KEY;
  const mcpUrl = process.env.ZAPIER_MCP_URL;

  if (!apiKey) {
    console.warn('ZAPIER_MCP_API_KEY environment variable is not set. MCP tools will be disabled.');
    return undefined;
  }

  if (!mcpUrl) {
    console.warn('ZAPIER_MCP_URL environment variable is not set. MCP tools will be disabled.');
    return undefined;
  }

  return {
    type: 'mcp',
    server_label: 'zapier', // This label can be chosen as needed
    server_url: mcpUrl,
    require_approval: 'never', // Let OpenAI decide or handle approval flow if needed later
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': 'Calendar-Assistant/1.0' 
      // Content-Type is usually added by OpenAI or the MCP server
    }
  };
}

// Re-export validateCalendarAction from error-handling for compatibility
export const validateCalendarAction = validateCalendarActionFromErrorHandling;

// Placeholder zapierMCP object for backward compatibility
export const zapierMCP = {
  async executeCalendarAction(calendarAction: any) {
    // Placeholder implementation - should be replaced with actual MCP call
    console.warn('zapierMCP.executeCalendarAction called - this is a placeholder implementation');
    throw new Error('zapierMCP.executeCalendarAction is not implemented - calendar actions are now handled through OpenAI Responses API');
  },

  async checkHealth(): Promise<boolean> {
    // Placeholder implementation - should be replaced with actual health check
    console.warn('zapierMCP.checkHealth called - this is a placeholder implementation');
    const mcpUrl = process.env.ZAPIER_MCP_URL;
    if (!mcpUrl) {
      return false;
    }
    
    try {
      // Basic connectivity check
      const response = await fetch(`${mcpUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.ZAPIER_MCP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

// Removed ZapierMCPClient class and its methods (executeCalendarAction, readCalendarData, checkHealth, etc.)
// The OpenAI Responses API will directly handle interactions with the MCP server. 