import { Command } from 'commander';
import { MCPSkillGenerator } from './generator/index.js';
import { MCPExecutor } from './executor/index.js';

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name('mcp-to-skill')
    .description(
      'Convert MCP server to Claude Skill with progressive disclosure'
    )
    .version('1.0.0');

  // Generate subcommand (skill generation)
  program
    .command('generate')
    .description('Generate a Claude Skill from an MCP server configuration')
    .requiredOption(
      '--mcp-config <path>',
      'Path to MCP server configuration JSON'
    )
    .requiredOption('--output-dir <path>', 'Output directory for generated skill')
    .action(async (options: { mcpConfig: string; outputDir: string }) => {
      const generator = new MCPSkillGenerator(
        options.mcpConfig,
        options.outputDir
      );
      await generator.generate();
    });

  // Exec subcommand (runtime executor)
  program
    .command('exec')
    .description('Execute MCP tools at runtime')
    .requiredOption('--config <path>', 'Path to mcp-config.json')
    .option('--list', 'List available tools')
    .option('--describe <tool>', 'Get detailed schema for a tool')
    .option('--call <json>', 'Call a tool with JSON arguments')
    .action(async (options: {
      config: string;
      list?: boolean;
      describe?: string;
      call?: string;
    }) => {
      const executor = new MCPExecutor(options.config);

      try {
        if (options.list) {
          const tools = await executor.listTools();
          console.log(JSON.stringify(tools, null, 2));
        } else if (options.describe) {
          const schema = await executor.describeTool(options.describe);
          if (schema) {
            console.log(JSON.stringify(schema, null, 2));
          } else {
            console.error(`Tool not found: ${options.describe}`);
            process.exit(1);
          }
        } else if (options.call) {
          const callData = JSON.parse(options.call) as {
            tool: string;
            arguments?: Record<string, unknown>;
          };
          const result = await executor.callTool(
            callData.tool,
            callData.arguments ?? {}
          );
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Usage:');
          console.log('  mcp-to-skill exec --config <path> --list');
          console.log('  mcp-to-skill exec --config <path> --describe <tool_name>');
          console.log('  mcp-to-skill exec --config <path> --call \'{"tool": "name", "arguments": {...}}\'');
        }
      } finally {
        await executor.close();
      }
    });

  try {
    await program.parseAsync();
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}
