/**
 * MCP Server Configuration - Stdio transport
 */
export interface MCPStdioConfig {
  name: string;
  description?: string;
  type?: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

/**
 * MCP Server Configuration - HTTP/SSE transport
 */
export interface MCPHttpConfig {
  name: string;
  description?: string;
  type: 'http' | 'sse';
  url: string;
  headers?: Record<string, string>;
}

/**
 * Union type for all MCP server configurations
 */
export type MCPServerConfig = MCPStdioConfig | MCPHttpConfig;

/**
 * Claude Desktop config format wrapper
 */
export interface ClaudeDesktopConfig {
  mcpServers: Record<string, Omit<MCPServerConfig, 'name'>>;
}

/**
 * MCP Tool definition
 */
export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

/**
 * CLI Options
 */
export interface CLIOptions {
  mcpConfig: string;
  outputDir: string;
}
