# Locabriques MCP Server

A Model Context Protocol (MCP) server implementation for Locabriques, enabling AI language models to interact with Locabriques content through a standardized interface.

## MCP Tools

### 🧱 LEGO® Sets Database

| Tool Name | Description | Endpoint |
| :--- | :--- | :--- |
| `legoset_search_brickset` | Search the external Brickset API to find LEGO set IDs for registration | `GET /api/brickset/search/` |
| `legoset_search` | Search sets in our LEGO® sets database | `GET /api/legosets/` |
| `legoset_retrieve` | Retrieve a LEGO® set from our database | `GET /api/legosets/{id}/` |
| `legoset_register` | Register a new set in our LEGO® sets database, based on brickset API | `POST /api/legosets/register_from_brickset` |

### 🛍️ Shops

| Tool Name | Description | Endpoint |
| :--- | :--- | :--- |
| `shops_list` | List all shops registered on LocaBriques | `GET /api/shops/` |
| `shop_retrieve` | Retrieve a specific shop by its slug | `GET /api/shops/{slug}/` |
| `shop_list_sets` | List all sets rented in a specific shop | `GET /api/shops/{slug}/sets/` |
| `shop_retrieve_set` | Retrieve a specific set rented in a shop | `GET /api/shops/{slug}/sets/{id}/` |

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
