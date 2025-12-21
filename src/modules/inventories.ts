import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../lib/api-client.js';

export function registerInventoriesTools(server: McpServer) {
    server.tool(
        'inventory_list',
        'Search sets in our inventory database.',
        {
            page: z.number().optional().describe('A page number within the paginated result set.'),
            page_size: z.number().optional().describe('Number of results to return per page.'),
            search: z.string().optional().describe('Search inventories by set name or reference.'),
        },
        async (args) => {
            try {
                const response = await apiClient.get('/api/inventories/', {
                    params: {
                        page: args.page,
                        page_size: args.page_size,
                        search: args.search,
                    },
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                const status = error.response ? error.response.status : 'Unknown';
                const message = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: [${status}] - ${message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        'inventory_retrieve',
        'Retrieve a specific inventory.',
        {
            id: z.number().describe('A unique integer value identifying this Per-bags inventory.'),
        },
        async (args) => {
            try {
                const response = await apiClient.get(`/api/inventories/${args.id}/`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                const status = error.response ? error.response.status : 'Unknown';
                const message = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: [${status}] - ${message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
