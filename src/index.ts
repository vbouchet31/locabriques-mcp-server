import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAllModules } from './modules/index.js';

// Initialize the MCP Server
const server = new McpServer({
    name: 'mcp-server-locabriques',
    version: '1.0.0',
});

// Register all tool modules
registerAllModules(server);

// Start the server using Stdio transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log to stderr to avoid interfering with JSON-RPC on stdout
    console.error('LocaBriques MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
