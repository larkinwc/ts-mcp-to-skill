import type { MCPServerConfig, MCPTool } from './types.js';
/**
 * Connect to an MCP server and introspect its available tools.
 * Supports both stdio (command-based) and HTTP/SSE transports.
 */
export declare function introspectMCPServer(config: MCPServerConfig): Promise<MCPTool[]>;
