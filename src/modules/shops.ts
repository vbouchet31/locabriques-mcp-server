import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

export function registerShopsTools(server: McpServer) {
    // Tool: list_shops
    server.tool(
        'list_shops',
        'List all shops registered on LocaBriques. Allows filtering by open status and pagination.',
        {
            page: z.number().optional().describe('A page number within the paginated result set.'),
            page_size: z.number().optional().describe('Number of results to return per page.'),
            open_only: z.boolean().optional().describe("Limit results to shop currently open (set to 'true' to enable)"),
        },
        async ({ page, page_size, open_only }) => {
            try {
                const response = await apiClient.get('/api/shops/', {
                    params: { page, page_size, open_only },
                });

                // The API returns a relevant JSON structure, we return it as text/json content
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                // Error handling as requested: return readable error instead of crashing
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Could not fetch shops: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // Tool: get_shop
    server.tool(
        'get_shop',
        'Retrieve a specific shop registered on LocaBriques by its slug.',
        {
            slug: z.string().describe('The unique slug identifier of the shop.'),
        },
        async ({ slug }) => {
            try {
                const response = await apiClient.get(`/api/shops/${slug}/`);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Could not fetch shop '${slug}': ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
