import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../lib/api-client.js';
import FormData from 'form-data';
import axios from 'axios';

// Reusable schema parts based on OpenAPI
const LanguageCodeEnum = z.enum(['en', 'fr']).describe(`Language used to write description and comments about the products

* \`en\` - English
* \`fr\` - Français`);

const PostalAddressWriteSchema = z.object({
    address: z.string().max(128).optional(),
    address2: z.string().max(128).optional(),
    postal_code: z.string().max(12).optional(),
    city: z.string().max(128).optional(),
    country: z.string().optional(), // Ideally this would be an enum matching CountryEnum but simplified to string for now or should check definition
}).describe("Postal address configuration");

const UpdateShopBase = z.object({
    name: z.string().max(128).describe("Name of the shop"),
    description: z.string().describe("Full HTML description of the shop"),
    city: z.string().max(128).describe("Shop city for hand delivery"),
    image: z.string().describe("The shop image. Can be a public URL or a Base64 encoded string. The server will handle the multipart upload for you."),
    language_code: LanguageCodeEnum,
    bank_account_iban: z.string().max(34).describe("IBAN for transfers"),
    bank_account_bic: z.string().max(11).nullable().describe("BIC for transfers"),
    postaladdress: PostalAddressWriteSchema.nullable().describe("Full postal address object"),
    parcelshop_code: z.string().regex(/^[A-Za-z]{2}-[0-9]{6}$/).describe("MondialRelay code"),
});

const MyShopUpdateSchema = UpdateShopBase.shape;

const MyShopPartialUpdateSchema = UpdateShopBase.partial().shape;

export function registerMyShopTools(server: McpServer) {
    // GET /api/my_shop/
    server.tool(
        'myshop_retrieve',
        "Retrieve your shop data",
        {
            // No parameters
        },
        async () => {
            try {
                const response = await apiClient.get('/api/my_shop/');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // PUT /api/my_shop/
    server.tool(
        'myshop_update',
        "Update your shop info",
        {
            MyShopUpdateSchema,
        },
        async (params) => {
            try {
                const form = new FormData();

                Object.entries(params).forEach(([key, value]) => {
                    if (key !== 'image' && value !== undefined) {
                        form.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
                    }
                });

                if (params.image) {
                    if (params.image.startsWith('http')) {
                        const imageResponse = await axios.get(params.image, { responseType: 'stream' });
                        form.append('image', imageResponse.data, 'image.jpg');
                    } else if (params.image.startsWith('data:image')) {
                        const base64Data = params.image.split(',')[1];
                        const buffer = Buffer.from(base64Data, 'base64');
                        form.append('image', buffer, 'image.jpg');
                    }
                }

                const response = await apiClient.put('/api/my_shop/', form, {
                    headers: form.getHeaders(),
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // PATCH /api/my_shop/
    server.tool(
        'myshop_partial_update',
        "Partially update your shop information",
        {
            MyShopPartialUpdateSchema,
        },
        async (params) => {
            try {
                const form = new FormData();

                Object.entries(params).forEach(([key, value]) => {
                    if (key !== 'image' && value !== undefined) {
                        form.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
                    }
                });

                if (params.image) {
                    if (params.image.startsWith('http')) {
                        const imageResponse = await axios.get(params.image, { responseType: 'stream' });
                        form.append('image', imageResponse.data, 'image.jpg');
                    } else if (params.image.startsWith('data:image')) {
                        const base64Data = params.image.split(',')[1];
                        const buffer = Buffer.from(base64Data, 'base64');
                        form.append('image', buffer, 'image.jpg');
                    }
                }

                const response = await apiClient.patch('/api/my_shop/', form, {
                    headers: form.getHeaders(),
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // --- COUPONS ---

    const DiscountTypeEnum = z.enum(['percent', 'amount', 'week', 'month']).describe('Discount type');

    // Note: MinimalRentalDurationEnum values are inferred from context or could be strings like '1W', '2W' etc.
    // Based on openapi.yaml it's an enum but we might just use string if values aren't strictly guarded here or copy them.
    // openapi.yaml says: 1W, 2W, 3W, 1M.
    const MinimalRentalDurationEnum = z.enum(['1W', '2W', '3W', '1M']).describe('Minimal rental duration');

    // Schema matching PrivateCoupon in openapi.yaml
    const CouponBaseSchema = z.object({
        code: z.string().min(6).max(16).describe('Coupon code'),
        discount_value: z.number().int().min(1).max(2147483647).describe('Discount value'),
        discount_type: DiscountTypeEnum,
        usage_count: z.number().int().min(-2147483648).max(2147483647).optional().describe('Usage count'),
        max_usage_count: z.number().int().min(0).max(2147483647).optional().describe('Maaximum global usage count'),
        // using string for date as per openapi format: date. 
        // User note: "validity_end is using YYYY-MM-DD in english, DD/MM/YYYY in french".
        // API usually expects YYYY-MM-DD.
        validity_end: z.string().nullable().optional().describe('Validity end date (YYYY-MM-DD)'),
        restrict_to_product: z.number().int().nullable().optional().describe('Internal ID of a set to restrict this coupon to'),
        minimal_rental_duration: MinimalRentalDurationEnum.or(z.null()).optional().describe('Minimal rental duration condition'),
        comment: z.string().optional().describe('Private comment'),
        is_visible: z.boolean().describe('Publicly visible coupon?'),
    });

    const CouponCreateSchema = CouponBaseSchema.shape;
    const CouponUpdateSchema = CouponBaseSchema.shape; // PUT requires all or strict fields, usually same as create
    const CouponPartialUpdateSchema = CouponBaseSchema.partial().shape;

    // GET /api/my_shop/coupons/
    server.tool(
        'myshop_list_coupons',
        "List all coupons in your shop",
        {
            // No params
        },
        async () => {
            try {
                const response = await apiClient.get('/api/my_shop/coupons/');
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // POST /api/my_shop/coupons/
    server.tool(
        'myshop_create_coupon',
        "Register a new coupon set in your shop",
        {
            ...CouponCreateSchema
        },
        async (params) => {
            try {
                const response = await apiClient.post('/api/my_shop/coupons/', params);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // GET /api/my_shop/coupons/{id}/
    server.tool(
        'myshop_retrieve_coupon',
        "Retrieve a coupon from your shop",
        {
            id: z.number().describe('A unique integer value identifying this coupon.')
        },
        async ({ id }) => {
            try {
                const response = await apiClient.get(`/api/my_shop/coupons/${id}/`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // PUT /api/my_shop/coupons/{id}/
    server.tool(
        'myshop_update_coupon',
        "Update a coupon in your shop",
        {
            id: z.number().describe('A unique integer value identifying this coupon.'),
            ...CouponUpdateSchema
        },
        async (params) => {
            const { id, ...body } = params;
            try {
                const response = await apiClient.put(`/api/my_shop/coupons/${id}/`, body);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // PATCH /api/my_shop/coupons/{id}/
    server.tool(
        'myshop_partial_update_coupon',
        "Partially update a coupon in your shop",
        {
            id: z.number().describe('A unique integer value identifying this coupon.'),
            ...CouponPartialUpdateSchema
        },
        async (params) => {
            const { id, ...body } = params;
            try {
                const response = await apiClient.patch(`/api/my_shop/coupons/${id}/`, body);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // DELETE /api/my_shop/coupons/{id}/
    server.tool(
        'myshop_delete_coupon',
        "Remove a coupon from your shop",
        {
            id: z.number().describe('A unique integer value identifying this coupon.')
        },
        async ({ id }) => {
            try {
                await apiClient.delete(`/api/my_shop/coupons/${id}/`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Coupon ${id} deleted successfully.`,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
