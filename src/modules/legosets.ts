import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

export function registerLegosetsTools(server: McpServer) {
    // Tool: legoset_search
    server.tool(
        'legoset_search',
        'Search sets in our LEGO® sets database. This database only contains sets that have been previously integrated by a user.',
        {
            page: z.number().optional().describe('A page number within the paginated result set.'),
            search: z.string().optional().describe('Search sets by name, description, headline or LEGO® identifier. Only sets matching the whole string will be returned. This database only contains sets that have been previously integrated by a user.'),
        },
        async ({ page, search }) => {
            try {
                const response = await apiClient.get('/api/legosets/', {
                    params: { page, search },
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
                            text: `Could not search LEGO sets: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // Tool: legoset_retrieve
    server.tool(
        'legoset_retrieve',
        'Retrieve a LEGO® set from our database.',
        {
            id: z.number().describe('A unique integer value identifying this lego set.'),
        },
        async ({ id }) => {
            try {
                const response = await apiClient.get(`/api/legosets/${id}/`);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                const errorMessage = error.response?.status === 404
                    ? `LEGO set with id '${id}' not found`
                    : `Could not retrieve LEGO set '${id}': ${error.message}`;

                return {
                    content: [
                        {
                            type: 'text',
                            text: errorMessage,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // Tool: legoset_register
    server.tool(
        'legoset_register',
        'Register a new set in our LEGO® sets database, based on brickset API. Given a brickset id, we call the API, retrieve set data, and register it in our database. As we need some mandatory info, this call can fail in case some is missing. In this case, our team is automatically informed and will register the set manually (so no need to retry).',
        {
            brickset_set_id: z.number().describe('Set identifier in brickset database'),
        },
        async ({ brickset_set_id }) => {
            try {
                const response = await apiClient.post('/api/legosets/register_from_brickset', {
                    brickset_set_id,
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
                const status = error.response?.status;
                let errorMessage: string;

                if (status === 400) {
                    errorMessage = `Bad request when registering set: ${error.response?.data?.detail || error.message}`;
                } else if (status === 500) {
                    errorMessage = 'Import has failed for some reason. Team has been informed.';
                } else {
                    errorMessage = `Could not register LEGO set from brickset: ${error.message}`;
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: errorMessage,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
