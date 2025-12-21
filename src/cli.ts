import { Command } from 'commander';
import { MCPSkillGenerator } from './generator/index.js';

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name('mcp-to-skill')
    .description(
      'Convert MCP server to Claude Skill with progressive disclosure'
    )
    .requiredOption(
      '--mcp-config <path>',
      'Path to MCP server configuration JSON'
    )
    .requiredOption('--output-dir <path>', 'Output directory for generated skill')
    .parse();

  const options = program.opts<{
    mcpConfig: string;
    outputDir: string;
  }>();

  const generator = new MCPSkillGenerator(
    options.mcpConfig,
    options.outputDir
  );

  try {
    await generator.generate();
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}
