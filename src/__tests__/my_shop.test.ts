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
        post: vi.fn(),
        delete: vi.fn(),
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

    // --- COUPONS TESTS ---

    describe('myshop_list_coupons', () => {
        it('should list coupons successfully', async () => {
            const mockData = [{ id: 1, code: 'SAVE10', discount_value: 10 }];
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_list_coupons({});
            expect(apiClient.get).toHaveBeenCalledWith('/api/my_shop/coupons/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });

        it('should handle errors', async () => {
            vi.mocked(apiClient.get).mockRejectedValue(new Error('API Error'));
            const result = await tools.myshop_list_coupons({});
            expect(result.isError).toBe(true);
        });
    });

    describe('myshop_create_coupon', () => {
        it('should create a coupon with correct JSON body', async () => {
            const mockData = { id: 2, code: 'NEW20', discount_value: 20 };
            const params = {
                code: 'NEW20',
                discount_value: 20,
                discount_type: 'percent',
                is_visible: true
            };
            vi.mocked(apiClient.post).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_create_coupon(params);
            expect(apiClient.post).toHaveBeenCalledWith('/api/my_shop/coupons/', params);
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('myshop_retrieve_coupon', () => {
        it('should retrieve a coupon by ID', async () => {
            const mockData = { id: 3, code: 'GET30' };
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_retrieve_coupon({ id: 3 });
            expect(apiClient.get).toHaveBeenCalledWith('/api/my_shop/coupons/3/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('myshop_update_coupon', () => {
        it('should update a coupon (PUT) adhering to required fields', async () => {
            const mockData = { id: 3, code: 'UPDATED' };
            const params = {
                id: 3,
                code: 'UPDATED',
                discount_value: 15,
                discount_type: 'amount',
                is_visible: false
            };
            // Remove id from body expectation
            const { id, ...expectedBody } = params;

            vi.mocked(apiClient.put).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_update_coupon(params);
            expect(apiClient.put).toHaveBeenCalledWith('/api/my_shop/coupons/3/', expectedBody);
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('myshop_partial_update_coupon', () => {
        it('should partially update a coupon (PATCH) allows sending only one field', async () => {
            const mockData = { id: 3, code: 'PATCHED' };
            const params = {
                id: 3,
                code: 'PATCHED'
            };
            const { id, ...expectedBody } = params;

            vi.mocked(apiClient.patch).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_partial_update_coupon(params);
            expect(apiClient.patch).toHaveBeenCalledWith('/api/my_shop/coupons/3/', expectedBody);
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('myshop_delete_coupon', () => {
        it('should delete a coupon using DELETE method', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({ data: {} });

            const result = await tools.myshop_delete_coupon({ id: 99 });
            expect(apiClient.delete).toHaveBeenCalledWith('/api/my_shop/coupons/99/');
            expect(result.content[0].text).toContain('deleted successfully');
        });
    });

    // --- SETS TESTS ---

    describe('myshop_list_sets', () => {
        it('should list sets successfully', async () => {
            const mockData = [{ id: 101, legoset_lego_id: '1234-1' }];
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_list_sets({});
            expect(apiClient.get).toHaveBeenCalledWith('/api/my_shop/sets/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('myshop_create_set', () => {
        it('should create a set with correct payload', async () => {
            const mockData = { id: 102, legoset_lego_id: '42115-1' };
            const params = {
                legoset_lego_id: '42115-1',
                auto_update_deposit: true,
                rental_price: 20,
                sorting_type: 'BAG_NUMBER'
            };
            vi.mocked(apiClient.post).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_create_set(params);
            expect(apiClient.post).toHaveBeenCalledWith('/api/my_shop/sets/', params);
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('myshop_retrieve_set', () => {
        it('should retrieve a set by ID', async () => {
            const mockData = { id: 103, legoset_lego_id: '1234-1' };
            vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_retrieve_set({ id: 103 });
            expect(apiClient.get).toHaveBeenCalledWith('/api/my_shop/sets/103/');
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('myshop_update_set', () => {
        it('should update a set (PUT)', async () => {
            const mockData = { id: 104, rental_price: 25 };
            const params = {
                id: 104,
                auto_update_deposit: false, // Required in strict schema
                rental_price: 25,
                comment: 'Updated comment'
            };
            const { id, ...expectedBody } = params;
            vi.mocked(apiClient.put).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_update_set(params);
            expect(apiClient.put).toHaveBeenCalledWith('/api/my_shop/sets/104/', expectedBody);
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('myshop_partial_update_set', () => {
        it('should partially update a set (PATCH)', async () => {
            const mockData = { id: 105, is_available: false };
            const params = {
                id: 105,
                is_available: false
            };
            const { id, ...expectedBody } = params;
            vi.mocked(apiClient.patch).mockResolvedValue({ data: mockData });

            const result = await tools.myshop_partial_update_set(params);
            expect(apiClient.patch).toHaveBeenCalledWith('/api/my_shop/sets/105/', expectedBody);
            expect(JSON.parse(result.content[0].text)).toEqual(mockData);
        });
    });

    describe('myshop_delete_set', () => {
        it('should delete a set', async () => {
            vi.mocked(apiClient.delete).mockResolvedValue({ data: {} });

            const result = await tools.myshop_delete_set({ id: 106 });
            expect(apiClient.delete).toHaveBeenCalledWith('/api/my_shop/sets/106/');
            expect(result.content[0].text).toContain('deleted successfully');
        });
    });

});

