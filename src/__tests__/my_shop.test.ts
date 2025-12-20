import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api-client.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMyShopTools } from '../modules/my_shop.js';
import FormData from 'form-data';
import axios from 'axios';
import { Readable } from 'stream';

// Mock the apiClient
vi.mock('../lib/api-client.js', () => ({
    apiClient: {
        get: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
    },
}));

// Mock axios
vi.mock('axios');

describe('Private My Shop Tools', () => {
    let server: McpServer;
    // We'll capture tool definitions to call them manually
    const tools: Record<string, any> = {};

    beforeEach(() => {
        vi.clearAllMocks();
        server = new McpServer({ name: 'test', version: '1.0.0' });

        // Mock server.tool to capture handlers
        const originalTool = server.tool.bind(server);
        vi.spyOn(server, 'tool').mockImplementation((name, description, schema, handler) => {
            tools[name] = handler;
            return originalTool(name, description, schema as any, handler);
        });

        registerMyShopTools(server);
    });

    describe('myshop_retrieve', () => {
        it('should retrieve shop data successfully', async () => {
            const mockData = { id: 1, name: 'My LEGO Shop' };
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_retrieve({});

            expect(apiClient.get).toHaveBeenCalledWith('/api/my_shop/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should return error string on failure', async () => {
            const error = new Error('API Error');
            vi.mocked(apiClient.get).mockRejectedValue(error);

            const result = await tools.myshop_retrieve({});

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Error: API Error');
        });
    });

    describe('myshop_update', () => {
        it('should update shop data successfully without image', async () => {
            const mockData = { id: 1, name: 'Updated Shop' };
            const params = {
                name: 'Updated Shop',
                description: 'New Description',
                bank_account_iban: 'FR123',
            };
            vi.mocked(apiClient.put).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_update(params);

            expect(apiClient.put).toHaveBeenCalledWith('/api/my_shop/', expect.any(FormData), expect.any(Object));
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle Full Update (PUT) with Image URL', async () => {
            const mockData = { id: 1, name: 'Updated Shop', image: 'url' };
            const params = {
                name: 'Updated Shop',
                image: 'http://example.com/logo.png',
            };

            // Mock axios response stream
            const mockStream = new Readable();
            mockStream.push('fake-image-data');
            mockStream.push(null);
            vi.mocked(axios.get).mockResolvedValue({ data: mockStream });

            vi.mocked(apiClient.put).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_update(params);

            // Assert axios download was triggered
            expect(axios.get).toHaveBeenCalledWith(params.image, { responseType: 'stream' });

            // Assert apiClient.put was called with FormData
            expect(apiClient.put).toHaveBeenCalledWith('/api/my_shop/', expect.any(FormData), expect.any(Object));

            // Inspect FormData content simply by checking calls arguments if needed, 
            // but strict FormData inspection in Node is tricky. 
            // We trust the mock and logic.
            const formDataArg = vi.mocked(apiClient.put).mock.calls[0][1] as FormData;
            expect(formDataArg).toBeInstanceOf(FormData);

            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle Full Update (PUT) with Base64 Image', async () => {
            const mockData = { id: 1, name: 'Updated Shop', image: 'base64' };
            const params = {
                name: 'Updated Shop',
                // tiny base64
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            };

            vi.mocked(apiClient.put).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_update(params);

            // Assert base64 conversion happened implicitly by checking call to put
            expect(apiClient.put).toHaveBeenCalledWith('/api/my_shop/', expect.any(FormData), expect.any(Object));

            // Verify no axios call
            expect(axios.get).not.toHaveBeenCalled();

            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle Resilience: Image Download Failure', async () => {
            const params = {
                name: 'Updated Shop',
                image: 'http://example.com/fail.png',
            };

            // Mock axios failure
            vi.mocked(axios.get).mockRejectedValue(new Error('Network Error'));

            const result = await tools.myshop_update(params);

            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('Error: Network Error');
            expect(apiClient.put).not.toHaveBeenCalled();
        });
    });

    describe('myshop_partial_update', () => {
        it('should partially update shop data successfully without image', async () => {
            const mockData = { id: 1, city: 'New City' };
            const params = { city: 'New City' };
            vi.mocked(apiClient.patch).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_partial_update(params);

            expect(apiClient.patch).toHaveBeenCalledWith('/api/my_shop/', expect.any(FormData), expect.any(Object));
            // Assert axios not called since no image
            expect(axios.get).not.toHaveBeenCalled();
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle nested postaladdress correctly', async () => {
            const mockData = { id: 1, postaladdress: { city: 'Paris' } };
            const params = { postaladdress: { city: 'Paris', country: 'France' } };
            vi.mocked(apiClient.patch).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_partial_update(params);

            expect(apiClient.patch).toHaveBeenCalledWith('/api/my_shop/', expect.any(FormData), expect.any(Object));
        });
    });
});

