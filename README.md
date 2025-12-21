# mcp-to-skill

Convert any MCP server into a Claude Skill with 90% context savings.

## Why This Exists

MCP servers are great but load all tool definitions into context at startup. With 20+ tools, that's 30-50k tokens gone before Claude does any work.

This converter applies the "progressive disclosure" pattern to any MCP server:
- **Startup**: ~100 tokens (just metadata)
- **When used**: ~5k tokens (full instructions)
- **Executing**: 0 tokens (runs externally)

## Quick Start

```bash
# Install dependencies
npm install

# Create your MCP config file (or use Claude Desktop format)
cat > my-mcp.json << 'EOF'
{
  "name": "github",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {"GITHUB_TOKEN": "your-token-here"}
}
EOF

# Convert to Skill
npm run dev -- --mcp-config my-mcp.json --output-dir ./skills/github

# Install skill dependencies
cd ./skills/github && npm install

# Copy to Claude
cp -r ./skills/github ~/.claude/skills/
```

Done! Claude can now use GitHub tools with minimal context.

## Supported Config Formats

### Direct format
```json
{
  "name": "github",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {"GITHUB_TOKEN": "your-token"}
}
```

### Claude Desktop format
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_TOKEN": "your-token"}
    }
  }
}
```

### HTTP/SSE transport
```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "http://localhost:8080/mcp",
      "headers": {}
    }
  }
}
```

## What It Generates

The converter creates:
- `SKILL.md` - Instructions for Claude (~100 tokens metadata)
- `executor.ts` - TypeScript executor (runs with `npx tsx`)
- `mcp-config.json` - MCP server configuration
- `package.json` - Dependencies

## Context Savings

**Before (MCP)**:
```
20 tools = 30k tokens always loaded
Context available: 170k / 200k = 85%
```

**After (Skills)**:
```
20 skills = 2k tokens metadata
When 1 skill active: 7k tokens
Context available: 193k / 200k = 96.5%
```

## Works With

Any standard MCP server:
- @modelcontextprotocol/server-github
- @modelcontextprotocol/server-slack
- @modelcontextprotocol/server-filesystem
- @modelcontextprotocol/server-postgres
- HTTP/SSE-based MCP servers
- Your custom MCP servers

## Requirements

- Node.js 18+

```bash
npm install
```

## Testing Generated Skills

```bash
cd skills/your-skill

# List tools
npx tsx executor.ts --list

# Describe a tool
npx tsx executor.ts --describe tool_name

# Call a tool
npx tsx executor.ts --call '{"tool": "tool_name", "arguments": {...}}'
```

## How It Works

```
┌─────────────────────────────────────┐
│ Your MCP Config                     │
│ (JSON file)                         │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ mcp-to-skill                        │
│ - Reads config                      │
│ - Introspects MCP server            │
│ - Generates Skill structure         │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Generated Skill                     │
│ ├── SKILL.md (100 tokens)           │
│ ├── executor.ts (TypeScript)        │
│ ├── mcp-config.json                 │
│ └── package.json                    │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Claude                              │
│ - Loads metadata only               │
│ - Full docs when needed             │
│ - Runs executor.ts for tools        │
└─────────────────────────────────────┘
```

## When To Use

**Use this converter when:**
- You have 10+ tools
- Context space is tight
- Most tools won't be used in each conversation
- Tools are independent

**Stick with MCP when:**
- You have 1-5 tools
- Need complex OAuth flows
- Need persistent connections

**Best approach: Use both**
- MCP for core tools
- Skills for extended toolset

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- --mcp-config example-github-mcp.json --output-dir ./test-output

# Build for distribution
npm run build
```

## Credits

Inspired by:
- [playwright-skill](https://github.com/lackeyjb/playwright-skill) by @lackeyjb
- [Anthropic Skills](https://www.anthropic.com/news/skills) framework
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
