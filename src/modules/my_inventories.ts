import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../lib/api-client.js';

export function registerMyInventoryTools(server: McpServer) {
    // GET /api/inventories/mine/
    server.tool(
        'myinventory_list',
        "List your own per-bags set inventories",
        {
            page: z.number().int().optional().describe('A page number within the paginated result set.'),
            page_size: z.number().int().optional().describe('Number of results to return per page.'),
        },
        async (params) => {
            try {
                const response = await apiClient.get('/api/inventories/mine/', {
                    params,
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
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // POST /api/inventories/mine/
    server.tool(
        'myinventory_create',
        "Register a new per-bags set inventory",
        {
            set_num: z.string().regex(/^[0-9]{3,}-[0-9]$/).describe('LEGO® identifier of the set to add'),
        },
        async (params) => {
            try {
                const response = await apiClient.post('/api/inventories/mine/', params);
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
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // GET /api/inventories/mine/{id}/
    server.tool(
        'myinventory_retrieve',
        "Retrieve one of your own per-bags set inventories",
        {
            id: z.number().int().describe('A unique integer value identifying this Per-bags inventory.'),
        },
        async (params) => {
            try {
                const response = await apiClient.get(`/api/inventories/mine/${params.id}/`);
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
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );


    // DELETE /api/inventories/mine/{id}/
    server.tool(
        'myinventory_delete',
        "Delete one of your per-bag inventories",
        {
            id: z.number().int().describe('A unique integer value identifying this Per-bags inventory.'),
        },
        async (params) => {
            try {
                await apiClient.delete(`/api/inventories/mine/${params.id}/`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: "Inventory deleted",
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // GET /api/inventories/mine/{id}/bags/
    server.tool(
        'myinventory_list_bags',
        "List all bags from an inventory",
        {
            id: z.number().int().describe('ID of the inventory to look up'),
        },
        async (params) => {
            try {
                const response = await apiClient.get(`/api/inventories/mine/${params.id}/bags/`);
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
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // POST /api/inventories/mine/{id}/bags/
    server.tool(
        'myinventory_create_bag',
        "Create a new bag in your inventory",
        {
            id: z.number().int().describe('ID of the inventory to add bag to'),
            bag_number: z.string().min(1).max(32).describe('Bag number'),
        },
        async (params) => {
            try {
                const response = await apiClient.post(`/api/inventories/mine/${params.id}/bags/`, {
                    bag_number: params.bag_number
                }, {
                    params: {
                        bag_number: params.bag_number
                    }
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
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // GET /api/inventories/mine/{id}/bags/{bag_number_slug}/
    server.tool(
        'myinventory_retrieve_bag',
        "Retrieve a bag present in an inventory",
        {
            id: z.number().int().describe('ID of the inventory to look up'),
            bag_number_slug: z.string().describe('bag number to retrieve'),
        },
        async (params) => {
            try {
                const response = await apiClient.get(`/api/inventories/mine/${params.id}/bags/${params.bag_number_slug}/`);
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
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // DELETE /api/inventories/mine/{id}/bags/{bag_number_slug}/
    server.tool(
        'myinventory_delete_bag',
        "Delete a bag from one of your inventories",
        {
            id: z.number().int().describe('ID of the inventory to delete bag from'),
            bag_number_slug: z.string().describe('Slug of the bag to delete'),
        },
        async (params) => {
            try {
                await apiClient.delete(`/api/inventories/mine/${params.id}/bags/${params.bag_number_slug}/`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: "Bag deleted",
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}

