import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

export function registerThemesTools(server: McpServer) {
    // Tool: theme_search
    server.tool(
        'theme_search',
        'Search themes in our LEGO® sets database',
        {
            page: z.number().optional().describe('A page number within the paginated result set.'),
            search: z.string().optional().describe('Search theme by slug. Only themes matching the whole string will be returned. This detabase only contains themes from sets  that have been previously integrated by a user.'),
        },
        async ({ page, search }) => {
            try {
                const response = await apiClient.get('/api/themes/', {
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
                            text: `Error: [${error.response?.status || 'Unknown'}] - ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // Tool: theme_retrieve
    server.tool(
        'theme_retrieve',
        'Retrieve a LEGO® theme from our database',
        {
            id: z.number().describe('A unique integer value identifying this theme.'),
        },
        async ({ id }) => {
            try {
                const response = await apiClient.get(`/api/themes/${id}/`);

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
                            text: `Error: [${error.response?.status || 'Unknown'}] - ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
