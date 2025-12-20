import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerLegosetsTools } from '../modules/legosets.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

// Mock the API client
vi.mock('../lib/api-client.js', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('Legosets Module', () => {
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
        registerLegosetsTools(server);
    });

    it('should register all legoset tools', () => {
        expect(tools).toHaveProperty('legoset_search');
        expect(tools).toHaveProperty('legoset_retrieve');
        expect(tools).toHaveProperty('legoset_register');
    });

    describe('legoset_search', () => {
        it('should call API with correct parameters including search', async () => {
            const handler = tools['legoset_search'].handler;
            const mockData = { results: [{ id: 1, name: 'Star Wars Set' }] };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ page: 2, search: 'star wars' });

            expect(apiClient.get).toHaveBeenCalledWith('/api/legosets/', {
                params: { page: 2, search: 'star wars' },
            });
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should call API without optional params', async () => {
            const handler = tools['legoset_search'].handler;
            const mockData = { results: [] };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({});

            expect(apiClient.get).toHaveBeenCalledWith('/api/legosets/', {
                params: { page: undefined, search: undefined },
            });
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle API errors gracefully', async () => {
            const handler = tools['legoset_search'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('Network Error'));

            const result = await handler({});

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Could not search LEGO sets: Network Error');
        });
    });

    describe('legoset_retrieve', () => {
        it('should fetch legoset by id in URL path', async () => {
            const handler = tools['legoset_retrieve'].handler;
            const mockData = { id: 123, name: 'LEGO Technic' };
            (apiClient.get as any).mockResolvedValue({ data: mockData });

            const result = await handler({ id: 123 });

            expect(apiClient.get).toHaveBeenCalledWith('/api/legosets/123/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle 404 error gracefully', async () => {
            const handler = tools['legoset_retrieve'].handler;
            const error: any = new Error('Not Found');
            error.response = { status: 404 };
            (apiClient.get as any).mockRejectedValue(error);

            const result = await handler({ id: 999 });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toBe("LEGO set with id '999' not found");
        });

        it('should handle other API errors gracefully', async () => {
            const handler = tools['legoset_retrieve'].handler;
            (apiClient.get as any).mockRejectedValue(new Error('Server Error'));

            const result = await handler({ id: 123 });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("Could not retrieve LEGO set '123': Server Error");
        });
    });

    describe('legoset_register', () => {
        it('should POST with brickset_set_id in the request body', async () => {
            const handler = tools['legoset_register'].handler;
            const mockData = { id: 456, name: 'Newly Registered Set' };
            (apiClient.post as any).mockResolvedValue({ data: mockData });

            const result = await handler({ brickset_set_id: 78901 });

            expect(apiClient.post).toHaveBeenCalledWith('/api/legosets/register_from_brickset', {
                brickset_set_id: 78901,
            });
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle 400 Bad Request error', async () => {
            const handler = tools['legoset_register'].handler;
            const error: any = new Error('Bad Request');
            error.response = { status: 400, data: { detail: 'Invalid brickset_set_id' } };
            (apiClient.post as any).mockRejectedValue(error);

            const result = await handler({ brickset_set_id: -1 });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Bad request when registering set: Invalid brickset_set_id');
        });

        it('should handle 500 Import Failed error', async () => {
            const handler = tools['legoset_register'].handler;
            const error: any = new Error('Import Failed');
            error.response = { status: 500 };
            (apiClient.post as any).mockRejectedValue(error);

            const result = await handler({ brickset_set_id: 12345 });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toBe('Import has failed for some reason. Team has been informed.');
        });

        it('should handle other API errors gracefully', async () => {
            const handler = tools['legoset_register'].handler;
            (apiClient.post as any).mockRejectedValue(new Error('Network Error'));

            const result = await handler({ brickset_set_id: 12345 });

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Could not register LEGO set from brickset: Network Error');
        });
    });
});
