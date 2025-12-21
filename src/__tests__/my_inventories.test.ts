
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';
import { registerMyInventoryTools } from '../modules/my_inventories.js';

// Mock the apiClient
vi.mock('../lib/api-client.js', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('My Inventories Tools', () => {
    let server: McpServer;
    const tools: Record<string, any> = {};

    beforeEach(() => {
        vi.clearAllMocks();
        server = new McpServer({
            name: 'test-server',
            version: '1.0.0',
        });

        // Mock server.tool to capture handlers
        const originalTool = server.tool.bind(server);
        vi.spyOn(server, 'tool').mockImplementation((name, description, schema, handler) => {
            tools[name] = handler;
            return originalTool(name, description, schema as any, handler);
        });

        registerMyInventoryTools(server);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('myinventory_list', () => {
        it('should correctly call the API with parameters', async () => {
            const mockData = { results: [] };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const tool = tools.myinventory_list;
            if (!tool) throw new Error('Tool not found');

            const result = await tool({ page: 2, page_size: 20 });

            expect(apiClient.get).toHaveBeenCalledWith('/api/inventories/mine/', {
                params: { page: 2, page_size: 20 },
            });
            expect(result).toEqual({
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(mockData, null, 2),
                    },
                ],
            });
        });

        it('should handle API errors gracefully', async () => {
            const errorMessage = 'API Error';
            (apiClient.get as any).mockRejectedValue(new Error(errorMessage));

            const tool = tools.myinventory_list;
            if (!tool) throw new Error('Tool not found');

            const result = await tool({});

            expect(result).toEqual({
                content: [
                    {
                        type: 'text',
                        text: `Error: ${errorMessage}`,
                    },
                ],
                isError: true,
            });
        });
    });

    describe('myinventory_create', () => {
        it('should correctly call the API with POST and parameters', async () => {
            const mockData = { id: 123, set_num: '10333-1' };
            const inputData = { set_num: '10333-1' };
            (apiClient.post as any).mockResolvedValue({ data: mockData });

            const tool = tools.myinventory_create;
            if (!tool) throw new Error('Tool not found');

            const result = await tool(inputData);

            expect(apiClient.post).toHaveBeenCalledWith('/api/inventories/mine/', inputData);
            expect(result).toEqual({
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(mockData, null, 2),
                    },
                ],
            });
        });

        it('should handle API errors gracefully', async () => {
            const errorMessage = 'Creation Failed';
            (apiClient.post as any).mockRejectedValue(new Error(errorMessage));

            const tool = tools.myinventory_create;
            if (!tool) throw new Error('Tool not found');

            const result = await tool({ set_num: '10333-1' });

            expect(result).toEqual({
                content: [
                    {
                        type: 'text',
                        text: `Error: ${errorMessage}`,
                    },
                ],
                isError: true,
            });
        });
    });
});
