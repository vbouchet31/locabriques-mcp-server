import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUserTools } from '../modules/users.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

// Mock the API client
vi.mock('../lib/api-client.js', () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe('Users Module', () => {
    let server: McpServer;
    let tools: Record<string, any> = {};

    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        // Mock server to capture tools
        tools = {};
        server = {
            tool: (name: string, description: string, schema: any, handler: any) => {
                tools[name] = { schema, handler };
            },
        } as unknown as McpServer;

        // Register tools
        registerUserTools(server);
    });

    it('should register user_list tool', () => {
        expect(tools).toHaveProperty('user_list');
    });

    it('should call API with correct parameters (only searched_string)', async () => {
        const handler = tools['user_list'].handler;
        const mockData = { results: [] };
        (apiClient.get as any).mockResolvedValue({ data: mockData });

        const result = await handler({ searched_string: 'vincent' });

        expect(apiClient.get).toHaveBeenCalledWith('/api/users/', {
            params: { searched_string: 'vincent', page: undefined, page_size: undefined },
        });
        expect(JSON.parse(result.content[0].text)).toEqual(mockData);
    });

    it('should call API with all parameters', async () => {
        const handler = tools['user_list'].handler;
        const mockData = { results: [] };
        (apiClient.get as any).mockResolvedValue({ data: mockData });

        const result = await handler({ searched_string: 'vincent', page: 2, page_size: 50 });

        expect(apiClient.get).toHaveBeenCalledWith('/api/users/', {
            params: { searched_string: 'vincent', page: 2, page_size: 50 },
        });
        expect(JSON.parse(result.content[0].text)).toEqual(mockData);
    });

    it('should handle API errors gracefully', async () => {
        const handler = tools['user_list'].handler;
        (apiClient.get as any).mockRejectedValue(new Error('Network error'));

        const result = await handler({ searched_string: 'fail' });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Could not fetch users: Network error');
    });
});
