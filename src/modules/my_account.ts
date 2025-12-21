
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
}
