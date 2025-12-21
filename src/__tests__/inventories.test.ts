import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api-client.js';
import { registerInventoriesTools } from '../modules/inventories.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Mock the apiClient
vi.mock('../lib/api-client.js', () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe('Inventories Tools', () => {
    let server: McpServer;
    let tools: Record<string, any> = {};

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Mock server to capture tools
        tools = {};
        server = {
            tool: (name: string, description: string, argsSchema: any, handler: any) => {
                tools[name] = { schema: argsSchema, handler };
            },
        } as unknown as McpServer;

        registerInventoriesTools(server);
    });

    describe('inventory_list', () => {
        it('should call API with correct parameters', async () => {
            const mockResponse = {
                data: {
                    results: [{ id: 1, name: 'Inventory 1' }],
                    count: 1,
                },
            };
            (apiClient.get as any).mockResolvedValue(mockResponse);

            const tool = tools['inventory_list'];
            if (!tool) throw new Error('Tool not found');

            const result = await tool.handler({
                page: 1,
                page_size: 10,
                search: 'test',
            });

            expect(apiClient.get).toHaveBeenCalledWith('/api/inventories/', {
                params: {
                    page: 1,
                    page_size: 10,
                    search: 'test',
                },
            });

            expect(result).toEqual({
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(mockResponse.data, null, 2),
                    },
                ],
            });
        });

        it('should handle API errors gracefully', async () => {
            const error = {
                response: {
                    status: 400,
                    data: { detail: 'Bad Request' },
                },
            };
            (apiClient.get as any).mockRejectedValue(error);

            const tool = tools['inventory_list'];
            if (!tool) throw new Error('Tool not found');

            const result = await tool.handler({});

            expect(result).toEqual({
                content: [
                    {
                        type: 'text',
                        text: 'Error: [400] - {"detail":"Bad Request"}',
                    },
                ],
                isError: true,
            });
        });
    });

    describe('inventory_retrieve', () => {
        it('should call API with correct ID injected in path', async () => {
            const mockResponse = {
                data: { id: 123, name: 'Inventory 123' },
            };
            (apiClient.get as any).mockResolvedValue(mockResponse);

            const tool = tools['inventory_retrieve'];
            if (!tool) throw new Error('Tool not found');

            const result = await tool.handler({
                id: 123,
            });

            expect(apiClient.get).toHaveBeenCalledWith('/api/inventories/123/');

            expect(result).toEqual({
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(mockResponse.data, null, 2),
                    },
                ],
            });
        });

        it('should handle 404 errors gracefully', async () => {
            const error = {
                response: {
                    status: 404,
                    data: { detail: 'Not Found' },
                },
            };
            (apiClient.get as any).mockRejectedValue(error);

            const tool = tools['inventory_retrieve'];
            if (!tool) throw new Error('Tool not found');

            const result = await tool.handler({
                id: 999,
            });

            expect(result).toEqual({
                content: [
                    {
                        type: 'text',
                        text: 'Error: [404] - {"detail":"Not Found"}',
                    },
                ],
                isError: true,
            });
        });
    });
});
