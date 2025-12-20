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

    it('should register shops_list and shop_retrieve tools', () => {
        expect(tools).toHaveProperty('shops_list');
        expect(tools).toHaveProperty('shop_retrieve');
    });

    describe('shops_list', () => {
        it('should call API with correct parameters', async () => {
            const handler = tools['shops_list'].handler;
            const mockData = { results: [] };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ page: 1, open_only: true });

            expect(apiClient.get).toHaveBeenCalledWith('/api/shops/', {
                params: { page: 1, open_only: true, page_size: undefined },
            });
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle API errors gracefully', async () => {
            const handler = tools['shops_list'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('API Failure'));

            const result = await handler({});

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Could not fetch shops: API Failure');
        });
    });

    describe('shop_retrieve', () => {
        it('should fetch shop by slug', async () => {
            const handler = tools['shop_retrieve'].handler;
            const mockData = { name: 'Test Shop' };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ slug: 'my-shop' });

            expect(apiClient.get).toHaveBeenCalledWith('/api/shops/my-shop/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('shop_list_sets', () => {
        it('should register shop_list_sets tool', () => {
            expect(tools).toHaveProperty('shop_list_sets');
        });

        it('should fetch sets by shop slug', async () => {
            const handler = tools['shop_list_sets'].handler;
            const mockData = [
                { id: 1, name: 'Set 1' },
                { id: 2, name: 'Set 2' },
            ];
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ slug: 'my-shop' });

            expect(apiClient.get).toHaveBeenCalledWith('/api/shops/my-shop/sets/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle API errors gracefully', async () => {
            const handler = tools['shop_list_sets'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('Shop not found'));

            const result = await handler({ slug: 'unknown-shop' });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Could not fetch sets for shop 'unknown-shop': Shop not found");
        });
    });

    describe('shop_retrieve_set', () => {
        it('should register shop_retrieve_set tool', () => {
            expect(tools).toHaveProperty('shop_retrieve_set');
        });

        it('should fetch a specific set by shop slug and set id', async () => {
            const handler = tools['shop_retrieve_set'].handler;
            const mockData = { id: '42', name: 'LEGO Set', lego_id: '10333-1' };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ slug: 'my-shop', id: '42' });

            expect(apiClient.get).toHaveBeenCalledWith('/api/shops/my-shop/sets/42/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle API errors gracefully', async () => {
            const handler = tools['shop_retrieve_set'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('Set not found'));

            const result = await handler({ slug: 'my-shop', id: '999' });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Could not fetch set '999' from shop 'my-shop': Set not found");
        });
    });
});
