import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerShopsTools } from './shops.js';
import { registerLegosetsTools } from './legosets.js';
import { registerCatalogsTools } from './catalogs.js';

export function registerAllModules(server: McpServer) {
    registerShopsTools(server);
    registerLegosetsTools(server);
    registerCatalogsTools(server);
}
