import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../lib/api-client.js';

export function registerUserTools(server: McpServer) {
    server.tool(
        'user_list',
        'List all users registered on LocaBriques whose username matches \'searched_string\'',
        {
            searched_string: z.string().min(3).describe('part of username to look for. At least 3 chars.'),
            page: z.number().int().optional().describe('A page number within the paginated result set.'),
            page_size: z.number().int().optional().describe('Number of results to return per page.'),
        },
        async ({ searched_string, page, page_size }) => {
            try {
                const response = await apiClient.get('/api/users/', {
                    params: { searched_string, page, page_size },
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
                const errorMessage = error.response?.data
                    ? JSON.stringify(error.response.data, null, 2)
                    : error.message;

                // We use console.error for critical debugging as permitted, but no console.log
                if (!error.response) {
                    console.error('Critical error in user_list tool:', error);
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Could not fetch users: ${errorMessage}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
