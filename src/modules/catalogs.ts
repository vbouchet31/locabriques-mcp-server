import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { apiClient } from '../lib/api-client.js';

export function registerCatalogsTools(server: McpServer) {
    // Tool: catalog_list
    server.tool(
        'catalog_list',
        'List all our catalogs. Returns links to different available catalogs.',
        {},
        async () => {
            try {
                const response = await apiClient.get('/api/catalogs/');

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
                            text: `Could not fetch catalogs: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // Tool: catalog_list_sets
    server.tool(
        'catalog_list_sets',
        'List all LEGO® sets available for rental in our owners\' shops. Supports extensive filtering by price, rating, age, theme, and more.',
        {
            page: z.number().optional().describe('A page number within the paginated result set.'),
            page_size: z.number().optional().describe('Number of results to return per page.'),
            min_price: z.number().optional().describe('Limit results to sets proposed for at least the given price (in euros)'),
            max_price: z.number().optional().describe('Limit results to sets proposed for at most the given price (in euros).'),
            min_rate: z.number().optional().describe('Limit results to sets whose average rating is at least the given number'),
            max_rate: z.number().optional().describe('Limit results to sets whose average rating is at most the given number'),
            min_age: z.number().optional().describe('Limit results to sets whose age category is at least the given one'),
            max_age: z.number().optional().describe("Limit results to sets whose age category is at most the given one. 19 is used for '18+'"),
            min_part_count: z.number().optional().describe('Limit results to sets containing at least this number of parts'),
            max_part_count: z.number().optional().describe('Limit results to sets containing at most this number of parts'),
            searched_string: z.string().optional().describe('Limit results to sets matching this parameter in their name, headline, description or lego_id (and some custom keywords we might add based on our users common spelling mistakes !). If multiple words are specified, they will be splited and resulting sets will match every word.'),
            theme: z.string().optional().describe('Limit results to sets if their theme (or parent theme) matches parameter (slug is used instead of name). This parameter can be used several times in a single call, results will then be merged.'),
            sort: z.enum(['-_average_rate', '-name', '-release_year', '-rental_price', '_average_rate', 'name', 'newest', 'release_year', 'rental_price']).optional().describe('Result ordering. Newest means "most recently added to our catalog first. Please notice the underscore before average rate, its mandatory and due to internal reasons. This relies on set reviews left by our user. Other values should be straightforward to understand.'),
            sorting_type: z.array(z.enum(['BAG_NUMBER', 'COLOR', 'OTHER'])).optional().describe('Limit results to sets are available with specific sorting type'),
            exclude_mine: z.boolean().optional().describe('If you are authenticated and own a shop, exclude from results the sets present in your shop inventory'),
            exclude_no_rates: z.boolean().optional().describe('Limit results to sets that have at least one review'),
            exclude_not_available: z.boolean().optional().describe("Limit results to sets currently available (set to 'true' to enable)"),
            include_availability: z.boolean().optional().describe('Include availabilities for the sets (see CatalogLegoSetSerializer documentation). Set to "true" to activate'),
            include_images: z.boolean().optional().describe('Include all images for the sets (see CatalogLegoSetSerializer documentation). Set to "true" to activate'),
        },
        async (params) => {
            try {
                const response = await apiClient.get('/api/catalogs/sets/', {
                    params,
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
                            text: `Could not fetch catalog sets: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // Tool: catalog_retrieve_set
    server.tool(
        'catalog_retrieve_set',
        'Retrieve a LEGO® set present in at least one of our shops. Returns detailed information about a specific set available for rental.',
        {
            lego_id: z.string().describe('The LEGO® identifier of the set to retrieve'),
        },
        async ({ lego_id }) => {
            try {
                const response = await apiClient.get(`/api/catalogs/sets/${lego_id}/`);

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
                            text: `Could not fetch catalog set '${lego_id}': ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
