/**
 * Main generator class that converts MCP server to Claude Skill.
 */
export declare class MCPSkillGenerator {
    private configPath;
    private outputDir;
    private config;
    constructor(configPath: string, outputDir: string);
    generate(): Promise<void>;
    private writeSkillMd;
    private writeExecutorTs;
    private writeMcpConfig;
    private writePackageJson;
    private printSummary;
}
