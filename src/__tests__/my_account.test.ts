
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerMyAccountTools } from '../modules/my_account.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

// Mock the API client
vi.mock('../lib/api-client.js', () => ({
    apiClient: {
        get: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('My Account Module', () => {
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
        registerMyAccountTools(server);
    });

    describe('account_list_stock_alerts', () => {
        it('should register account_list_stock_alerts tool', () => {
            expect(tools).toHaveProperty('account_list_stock_alerts');
        });

        it('should call API correctly and list stock alerts', async () => {
            const handler = tools['account_list_stock_alerts'].handler;
            const mockData = [
                { id: 1, lego_set: "10333", name: "Barad-dûr" },
                { id: 2, lego_set: "75192", name: "Millennium Falcon" },
            ];
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({});

            expect(apiClient.get).toHaveBeenCalledWith('/api/my_account/backinstockalerts/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle API errors gracefully', async () => {
            const handler = tools['account_list_stock_alerts'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('API Failure'));

            const result = await handler({});

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toBe('API Failure');
        });
    });

    describe('account_delete_stock_alert', () => {
        it('should register account_delete_stock_alert tool', () => {
            expect(tools).toHaveProperty('account_delete_stock_alert');
        });

        it('should call API correctly to delete alert', async () => {
            const handler = tools['account_delete_stock_alert'].handler;
            (apiClient.delete as any).mockResolvedValue({});

            const result = await handler({ id: 123 });

            expect(apiClient.delete).toHaveBeenCalledWith('/api/my_account/backinstockalerts/123/');
            expect(result.content[0].text).toBe("Alert removed from your list");
        });

        it('should handle API errors gracefully (e.g. 404)', async () => {
            const handler = tools['account_delete_stock_alert'].handler;
            const error = new Error('Not Found');
            (apiClient.delete as any).mockRejectedValue(error);

            const result = await handler({ id: 999 });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toBe('Not Found');
        });
    });
});
