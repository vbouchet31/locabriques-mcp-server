import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

export function registerShopsTools(server: McpServer) {
    // Tool: shop_list
    server.tool(
        'shop_list',
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

    // Tool: shop_retrieve
    server.tool(
        'shop_retrieve',
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

    // Tool: shop_list_sets
    server.tool(
        'shop_list_sets',
        'List all sets rented in a specific shop on LocaBriques.',
        {
            slug: z.string().describe('Slug of the shop to look up'),
        },
        async ({ slug }) => {
            try {
                const response = await apiClient.get(`/api/shops/${slug}/sets/`);

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
                            text: `Could not fetch sets for shop '${slug}': ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // Tool: shop_retrieve_set
    server.tool(
        'shop_retrieve_set',
        'Retrieve a specific set rented in a shop on LocaBriques.',
        {
            slug: z.string().describe('Slug of the shop to look up'),
            id: z.string().describe('id of the set to retrieve'),
        },
        async ({ slug, id }) => {
            try {
                const response = await apiClient.get(`/api/shops/${slug}/sets/${id}/`);

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
                            text: `Could not fetch set '${id}' from shop '${slug}': ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
