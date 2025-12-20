import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerThemesTools } from '../modules/themes.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

// Mock the API client
vi.mock('../lib/api-client.js', () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe('Themes Module', () => {
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
        registerThemesTools(server);
    });

    it('should register theme_search and theme_retrieve tools', () => {
        expect(tools).toHaveProperty('theme_search');
        expect(tools).toHaveProperty('theme_retrieve');
    });

    describe('theme_search', () => {
        it('should call API with correct parameters', async () => {
            const handler = tools['theme_search'].handler;
            const mockData = { results: [] };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ page: 1, search: 'star wars' });

            expect(apiClient.get).toHaveBeenCalledWith('/api/themes/', {
                params: { page: 1, search: 'star wars' },
            });
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle API errors gracefully', async () => {
            const handler = tools['theme_search'].handler;
            // Mock an error with a response property to simulate axios error
            const mockError: any = new Error('API Failure');
            mockError.response = { status: 500 };
            (apiClient.get as any).mockRejectedValue(mockError);

            const result = await handler({});

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Error: [500] - API Failure');
        });
    });

    describe('theme_retrieve', () => {
        it('should fetch theme by id', async () => {
            const handler = tools['theme_retrieve'].handler;
            const mockData = { id: 123, name: 'Star Wars' };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ id: 123 });

            expect(apiClient.get).toHaveBeenCalledWith('/api/themes/123/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle API errors gracefully (e.g. 404)', async () => {
            const handler = tools['theme_retrieve'].handler;
            const mockError: any = new Error('Not Found');
            mockError.response = { status: 404 };
            (apiClient.get as any).mockRejectedValue(mockError);

            const result = await handler({ id: 999 });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Error: [404] - Not Found');
        });
    });
});
