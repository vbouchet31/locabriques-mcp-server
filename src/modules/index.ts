import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerShopsTools } from './shops.js';
import { registerLegosetsTools } from './legosets.js';
import { registerCatalogsTools } from './catalogs.js';
import { registerThemesTools } from './themes.js';
import { registerMyShopTools } from './my_shop.js';
import { registerInventoriesTools } from './inventories.js';
import { registerMyAccountTools } from './my_account.js';
import { registerUserTools } from './users.js';

export function registerAllModules(server: McpServer) {
    registerShopsTools(server);
    registerLegosetsTools(server);
    registerCatalogsTools(server);
    registerThemesTools(server);
    registerMyShopTools(server);
    registerUserTools(server);
    registerMyAccountTools(server);
    registerInventoriesTools(server);
}
