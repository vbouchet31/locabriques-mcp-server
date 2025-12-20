import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerShopsTools } from './shops.js';
import { registerLegosetsTools } from './legosets.js';
import { registerCatalogsTools } from './catalogs.js';
import { registerThemesTools } from './themes.js';
import { registerMyShopTools } from './my_shop.js';

export function registerAllModules(server: McpServer) {
    registerShopsTools(server);
    registerLegosetsTools(server);
    registerCatalogsTools(server);
    registerThemesTools(server);
    registerMyShopTools(server);
}
