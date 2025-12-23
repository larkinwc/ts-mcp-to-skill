import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { MCPServerConfig, MCPStdioConfig, MCPHttpConfig, MCPTool } from './types';

/**
 * Type guard to check if config is HTTP-based
 */
function isHttpConfig(config: MCPServerConfig): config is MCPHttpConfig {
  return config.type === 'http' || config.type === 'sse';
}

/**
 * Type guard to check if config is stdio-based
 */
function isStdioConfig(config: MCPServerConfig): config is MCPStdioConfig {
  return !config.type || config.type === 'stdio';
}

/**
 * Connect to an MCP server and introspect its available tools.
 * Supports both stdio (command-based) and HTTP/SSE transports.
 */
export async function introspectMCPServer(config: MCPServerConfig): Promise<MCPTool[]> {
  const client = new Client(
    { name: 'mcp-to-skill-introspector', version: '1.0.0' },
    { capabilities: {} }
  );

  let transport;

  if (isHttpConfig(config)) {
    // HTTP/SSE transport
    transport = new StreamableHTTPClientTransport(new URL(config.url), {
      requestInit: {
        headers: config.headers,
      },
    });
  } else if (isStdioConfig(config)) {
    // Stdio transport (spawn command)
    transport = new StdioClientTransport({
      command: config.command,
      args: config.args ?? [],
      env: config.env,
    });
  } else {
    throw new Error(`Unsupported transport type: ${(config as MCPServerConfig).type}`);
  }

  try {
    await client.connect(transport);

    const toolsResponse = await client.listTools();

    return toolsResponse.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema as Record<string, unknown>,
    }));
  } finally {
    await client.close();
  }
}
