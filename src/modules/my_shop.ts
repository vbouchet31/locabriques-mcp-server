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
}
