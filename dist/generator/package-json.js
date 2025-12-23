/**
 * Generate package.json for the generated skill.
 */
export function generatePackageJson(serverName) {
    return {
        name: `skill-${serverName}`,
        version: '1.0.0',
        type: 'module',
        description: `Claude Skill wrapper for ${serverName} MCP server`,
        scripts: {
            executor: 'npx tsx executor.ts',
        },
        dependencies: {
            '@modelcontextprotocol/sdk': '^1.0.0',
            tsx: '^4.0.0',
            zod: '^3.25.0',
        },
    };
}
