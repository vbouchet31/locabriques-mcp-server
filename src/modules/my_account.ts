
import { z } from "zod";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../lib/api-client.js";

const formatError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

export function registerMyAccountTools(server: McpServer) {
    server.tool(
        "account_list_stock_alerts",
        "List all your 'back in stock' alerts. This action allows you to list all sets in your 'back in stock' alerts.",
        {},
        async () => {
            try {
                const response = await apiClient.get("/api/my_account/backinstockalerts/");
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: formatError(error),
                        },
                    ],
                };
            }
        }
    );

    server.tool(
        "account_delete_stock_alert",
        "Remove a 'back in stock' alert. This action allows you to remove a 'back in stock' alert.",
        {
            id: z
                .number()
                .int()
                .describe("A unique integer value identifying this back in stock alert."),
        },
        async ({ id }) => {
            try {
                await apiClient.delete(`/api/my_account/backinstockalerts/${id}/`);
                return {
                    content: [
                        {
                            type: "text",
                            text: "Alert removed from your list",
                        },
                    ],
                };
            } catch (error) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: formatError(error),
                        },
                    ],
                };
            }
        }
    );

    server.tool(
        "account_list_wishlist",
        "List all sets in your wish list. This action allows you to list all sets in your wish list.",
        {},
        async () => {
            try {
                const response = await apiClient.get("/api/my_account/wishlist/");
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: formatError(error),
                        },
                    ],
                };
            }
        }
    );

    server.tool(
        "account_create_wishlist_item",
        "Add a new set in your wish list. This action allows you to add a new set in your wish list.",
        {
            legoset_lego_id: z
                .string()
                .regex(/^[0-9]{3,}-[0-9]$/)
                .describe("LEGO® identifier of the set to add"),
        },
        async ({ legoset_lego_id }) => {
            try {
                const response = await apiClient.post("/api/my_account/wishlist/", {
                    legoset_lego_id,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: formatError(error),
                        },
                    ],
                };
            }
        }
    );

    server.tool(
        "account_delete_wishlist_item",
        "Remove a set from your wish list. This action allows you to remove a set present in your wish list.",
        {
            id: z
                .number()
                .int()
                .describe("A unique integer value identifying this wish list item."),
        },
        async ({ id }) => {
            try {
                await apiClient.delete(`/api/my_account/wishlist/${id}/`);
                return {
                    content: [
                        {
                            type: "text",
                            text: "Set removed from your wish list",
                        },
                    ],
                };
            } catch (error) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: formatError(error),
                        },
                    ],
                };
            }
        }
    );
}
