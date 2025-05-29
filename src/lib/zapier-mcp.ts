// Zapier MCP Integration for Google Calendar Operations

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

// Removed ZapierMCPClient class and its methods (executeCalendarAction, readCalendarData, checkHealth, etc.)
// Removed validateCalendarAction as it's not currently used in the primary chat flow.
// The OpenAI Responses API will directly handle interactions with the MCP server. 