/**
 * MCP Executor - Runtime tool execution for skills
 * Can be used via CLI or programmatically
 */
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
export declare class MCPExecutor {
    private config;
    private client;
    constructor(configPathOrConfig: string | MCPConfig);
    connect(): Promise<void>;
    listTools(): Promise<{
        name: string;
        description?: string;
    }[]>;
    describeTool(toolName: string): Promise<unknown>;
    callTool(toolName: string, args: Record<string, unknown>): Promise<unknown>;
    close(): Promise<void>;
}
export {};
