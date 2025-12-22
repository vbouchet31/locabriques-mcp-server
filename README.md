# Locabriques MCP Server

A Model Context Protocol (MCP) server implementation for Locabriques, enabling AI language models to interact with Locabriques content through a standardized interface.

## MCP Tools

⚠️ Only Sets are supported. LightMybricks® and Customproducts are not supported on purpose due to limited usage on Locabriques and complexity of implementation.

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

### 📦 Inventories

| Tool Name | Description |
| :--- | :--- |
| `inventory_list` | Search sets in our inventory database. |
| `inventory_retrieve` | Retrieve a specific inventory. |


### 🧩 My Inventories

| Tool Name | Description |
| :--- | :--- |
| `myinventory_list` | List your own per-bags set inventories |
| `myinventory_create` | Register a new per-bags set inventory |
| `myinventory_retrieve` | Retrieve one of your own per-bags set inventories |
| `myinventory_delete` | Delete one of your per-bag inventories |
| `myinventory_list_bags` | List all bags from an inventory |
| `myinventory_create_bag` | Create a new bag in your inventory |
| `myinventory_retrieve_bag` | Retrieve a bag present in an inventory |
| `myinventory_delete_bag` | Delete a bag from one of your inventories |

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
| `myshop_list_sets` | List all sets in your inventory |
| `myshop_create_set` | Register a new set in your inventory |
| `myshop_retrieve_set` | Retrieve a set from your inventory |
| `myshop_update_set` | Update a set in your inventory |
| `myshop_partial_update_set` | Partially update a set in your inventory |
| `myshop_delete_set` | Remove a set from your inventory |

### 🎨 Themes

| Tool Name | Description |
| :--- | :--- |
| `theme_search` | Search themes in our LEGO® sets database |
| `theme_retrieve` | Retrieve a LEGO® theme from our database |

### 🪪 My Account

| Tool Name | Description |
| :--- | :--- |
| `account_list_stock_alerts` | List all your 'back in stock' alerts |
| `account_delete_stock_alert` | Remove a 'back in stock' alert |
| `account_list_wishlist` | List all sets in your wish list |
| `account_create_wishlist_item` | Add a new set in your wish list |
| `account_delete_wishlist_item` | Remove a set from your wish list |

### 👥 Users

| Tool Name | Description |
| :--- | :--- |
| `user_list` | List all users registered on LocaBriques whose username matches 'searched_string' |

## Installation

### Method 1: Using NPX (Recommended)
This is the simplest way. You don't need to install anything globally. 
Add this to your Claude Desktop configuration:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "locabriques": {
      "command": "npx",
      "args": ["-y", "@vbouchet31/locabriques-mcp-server"],
      "env": {
        "LOCABRIQUES_API_KEY": "your_locabriques_api_key_here"
      }
    }
  }
}
```

### Method 2: Global Installation
If you prefer to have the binary installed locally:

```bash
npm install -g @vbouchet31/locabriques-mcp-server
```

Add this to your configuration:

```json
{
  "mcpServers": {
    "locabriques": {
      "command": "locabriques-mcp",
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
        "args": ["-y", "@vbouchet31/locabriques-mcp-server"],
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
      "args": ["-y", "@vbouchet31/locabriques-mcp-server"],
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
