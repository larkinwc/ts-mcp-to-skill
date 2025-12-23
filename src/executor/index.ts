/**
 * MCP Executor - Runtime tool execution for skills
 * Can be used via CLI or programmatically
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface MCPStdioConfig {
  name: string;
  type?: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

interface MCPHttpConfig {
  name: string;
  type: 'http' | 'sse';
  url: string;
  headers?: Record<string, string>;
}

type MCPConfig = MCPStdioConfig | MCPHttpConfig;

function isHttpConfig(config: MCPConfig): config is MCPHttpConfig {
  return config.type === 'http' || config.type === 'sse';
}

export class MCPExecutor {
  private config: MCPConfig;
  private client: Client | null = null;

  constructor(configPathOrConfig: string | MCPConfig) {
    if (typeof configPathOrConfig === 'string') {
      // Load config from file path
      const configPath = path.resolve(configPathOrConfig);
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
      // Use config object directly
      this.config = configPathOrConfig;
    }
  }

  async connect(): Promise<void> {
    this.client = new Client(
      { name: 'skill-executor', version: '1.0.0' },
      { capabilities: {} }
    );

    let transport;

    if (isHttpConfig(this.config)) {
      // HTTP/SSE transport
      transport = new StreamableHTTPClientTransport(new URL(this.config.url), {
        requestInit: {
          headers: this.config.headers,
        },
      });
    } else {
      // Stdio transport
      transport = new StdioClientTransport({
        command: this.config.command,
        args: this.config.args ?? [],
        env: this.config.env,
      });
    }

    await this.client.connect(transport);
  }

  async listTools(): Promise<{ name: string; description?: string }[]> {
    if (!this.client) await this.connect();
    const response = await this.client!.listTools();
    return response.tools.map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }

  async describeTool(toolName: string): Promise<unknown> {
    if (!this.client) await this.connect();
    const response = await this.client!.listTools();
    const tool = response.tools.find((t) => t.name === toolName);
    if (!tool) return null;
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    };
  }

  async callTool(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    if (!this.client) await this.connect();
    const response = await this.client!.callTool({
      name: toolName,
      arguments: args,
    });
    return response.content;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}
