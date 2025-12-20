import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerCatalogsTools } from '../modules/catalogs.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

// Mock the API client
vi.mock('../lib/api-client.js', () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe('Catalogs Module', () => {
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
        registerCatalogsTools(server);
    });

    it('should register all catalog tools', () => {
        expect(tools).toHaveProperty('catalog_list');
        expect(tools).toHaveProperty('catalog_list_sets');
        expect(tools).toHaveProperty('catalog_retrieve_set');
    });

    describe('catalog_list', () => {
        it('should call API and return catalogs', async () => {
            const handler = tools['catalog_list'].handler;
            const mockData = { sets: '/api/catalogs/sets/', customproducts: '/api/catalogs/customproducts/' };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({});

            expect(apiClient.get).toHaveBeenCalledWith('/api/catalogs/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle API errors gracefully', async () => {
            const handler = tools['catalog_list'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('Network error'));

            const result = await handler({});

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Could not fetch catalogs: Network error');
        });
    });

    describe('catalog_list_sets', () => {
        it('should call API with correct query filters', async () => {
            const handler = tools['catalog_list_sets'].handler;
            const mockData = { results: [], count: 0 };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const params = {
                min_price: 10,
                max_price: 50,
                theme: 'star-wars',
                page: 1,
            };

            const result = await handler(params);

            expect(apiClient.get).toHaveBeenCalledWith('/api/catalogs/sets/', {
                params,
            });
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should pass all filter parameters correctly', async () => {
            const handler = tools['catalog_list_sets'].handler;
            const mockData = { results: [{ lego_id: '10333-1' }], count: 1 };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const params = {
                min_age: 12,
                max_age: 18,
                min_rate: 4,
                exclude_not_available: true,
                sort: 'newest',
                include_images: true,
            };

            const result = await handler(params);

            expect(apiClient.get).toHaveBeenCalledWith('/api/catalogs/sets/', {
                params,
            });
            expect(result.isError).toBeUndefined();
        });

        it('should handle API errors gracefully', async () => {
            const handler = tools['catalog_list_sets'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('Server error'));

            const result = await handler({});

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Could not fetch catalog sets: Server error');
        });
    });

    describe('catalog_retrieve_set', () => {
        it('should inject lego_id into URL path', async () => {
            const handler = tools['catalog_retrieve_set'].handler;
            const mockData = { lego_id: '10333-1', name: 'Barad-dûr' };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ lego_id: '10333-1' });

            expect(apiClient.get).toHaveBeenCalledWith('/api/catalogs/sets/10333-1/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle 404 for unknown set', async () => {
            const handler = tools['catalog_retrieve_set'].handler;
            const error = new Error('Not found');
            (error as any).response = { status: 404 };
            (apiClient.get as any).mockRejectedValue(error);

            const result = await handler({ lego_id: '99999-1' });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Could not fetch catalog set '99999-1': Not found");
        });

        it('should handle other API errors gracefully', async () => {
            const handler = tools['catalog_retrieve_set'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('Unauthorized'));

            const result = await handler({ lego_id: '10333-1' });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Could not fetch catalog set '10333-1': Unauthorized");
        });
    });
});
