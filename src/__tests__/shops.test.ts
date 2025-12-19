import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerShopsTools } from '../modules/shops.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

// Mock the API client
vi.mock('../lib/api-client.js', () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe('Shops Module', () => {
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
        registerShopsTools(server);
    });

    it('should register list_shops and get_shop tools', () => {
        expect(tools).toHaveProperty('list_shops');
        expect(tools).toHaveProperty('get_shop');
    });

    describe('list_shops', () => {
        it('should call API with correct parameters', async () => {
            const handler = tools['list_shops'].handler;
            const mockData = { results: [] };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ page: 1, open_only: true });

            expect(apiClient.get).toHaveBeenCalledWith('/api/shops/', {
                params: { page: 1, open_only: true, page_size: undefined },
            });
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle API errors gracefully', async () => {
            const handler = tools['list_shops'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('API Failure'));

            const result = await handler({});

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Could not fetch shops: API Failure');
        });
    });

    describe('get_shop', () => {
        it('should fetch shop by slug', async () => {
            const handler = tools['get_shop'].handler;
            const mockData = { name: 'Test Shop' };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ slug: 'my-shop' });

            expect(apiClient.get).toHaveBeenCalledWith('/api/shops/my-shop/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });
});
