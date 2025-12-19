import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerShopsTools } from './shops.js';

export function registerAllModules(server: McpServer) {
    registerShopsTools(server);
}
