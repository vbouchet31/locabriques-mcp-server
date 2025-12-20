# Locabriques MCP Server

A Model Context Protocol (MCP) server implementation for Locabriques, enabling AI language models to interact with Locabriques content through a standardized interface.

## MCP Tools

### 🧱 LEGO® Sets Database

| Tool Name | Description |
| :--- | :--- |
| `legoset_search_brickset` | Search the external Brickset API to find LEGO set IDs for registration |
| `legoset_search` | Search sets in our LEGO® sets database |
| `legoset_retrieve` | Retrieve a LEGO® set from our database |
| `legoset_register` | Register a new set in our LEGO® sets database, based on brickset API |

### 🛍️ Shops

| Tool Name | Description |
| :--- | :--- |
| `shop_list` | List all shops registered on LocaBriques |
| `shop_retrieve` | Retrieve a specific shop by its slug |
| `shop_list_sets` | List all sets rented in a specific shop |
| `shop_retrieve_set` | Retrieve a specific set rented in a shop |

### 📚 Catalogs

| Tool Name | Description |
| :--- | :--- |
| `catalog_list` | List all available catalogs |
| `catalog_list_sets` | List all LEGO® sets available for rental on LocaBriques |
| `catalog_retrieve_set` | Retrieve a specific LEGO® set available for rental |

### 🏪 My Shop

| Tool Name | Description |
| :--- | :--- |
| `myshop_retrieve` | Retrieve your shop data |
| `myshop_update` | Update your shop info (supports image via URL or Base64) |
| `myshop_partial_update` | Partially update your shop information (supports image via URL or Base64) |
| `myshop_list_coupons` | List all coupons in your shop |
| `myshop_create_coupon` | Register a new coupon set in your shop |
| `myshop_retrieve_coupon` | Retrieve a coupon from your shop |
| `myshop_update_coupon` | Update a coupon in your shop |
| `myshop_partial_update_coupon` | Partially update a coupon in your shop |
| `myshop_delete_coupon` | Remove a coupon from your shop |

### 🎨 Themes

| Tool Name | Description |
| :--- | :--- |
| `theme_search` | Search themes in our LEGO® sets database |
| `theme_retrieve` | Retrieve a LEGO® theme from our database |

## Installation

### Quick Setup for Claude Desktop

1. Install the package:
```bash
npm install -g locabriques-mcp-server
```

2. Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "locabriques-mcp-server": {
      "command": "locabriques-mcp-server",
      "env": {
        "LOCABRIQUES_API_KEY": "your_locabriques_api_key_here"
      }
    }
  }
}
```

### Alternative: Using NPX (No Installation Required)

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "locabriques": {
      "command": "npx",
      "args": ["-y", "locabriques-mcp-server"],
      "env": {
        "LOCABRIQUES_API_KEY": "your_locabriques_api_key_here"
      }
    }
  }
}
```

## Configuration
Set the following environment variables:
* `LOCABRIQUES_API_KEY`: Your Locabriques API key (required)

### Manual Installation

If you prefer manual installation, follow these steps:

Add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open User Settings (JSON)`.

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "apiKey",
        "description": "Locabriques API Key",
        "password": true
      }
    ],
    "servers": {
      "locabriques": {
        "command": "npx",
        "args": ["-y", "locabriques-mcp-server"],
        "env": {
          "LOCABRIQUES_API_KEY": "${input:apiKey}"
        }
      }
    }
  }
}
```

Optionally, you can add it to a file called `.vscode/mcp.json` in your workspace:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "apiKey",
      "description": "Locabriques API Key",
      "password": true
    }
  ],
  "servers": {
    "locabriques": {
      "command": "npx",
      "args": ["-y", "locabriques-mcp-server"],
      "env": {
        "LOCABRIQUES_API_KEY": "${input:apiKey}"
      }
    }
  }
}
```
## Locabriques API Setup
1. Go to your Locabriques account
2. Click "Settings" on the menu
3. Copy "My API key" from the "API" section
4. (Optional) Select "Grant my API key write access rights?" if you want to allow the MCP server to modify your data

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```
