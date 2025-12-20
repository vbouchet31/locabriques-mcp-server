import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerShopsTools } from './shops.js';
import { registerLegosetsTools } from './legosets.js';

export function registerAllModules(server: McpServer) {
    registerShopsTools(server);
    registerLegosetsTools(server);
}
