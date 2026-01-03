# Harper Slone MCP Server

An MCP (Model Context Protocol) server that provides AI assistants access to Harper Slone's portfolio information.

## Installation

```bash
cd mcp-server
npm install
```

## Usage

### Running the server

```bash
npm start
```

### Configuring with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "harperslone-portfolio": {
      "command": "node",
      "args": ["/path/to/harperslone/mcp-server/index.js"]
    }
  }
}
```

### Configuring with Cursor

Add to your Cursor MCP settings:

```json
{
  "harperslone-portfolio": {
    "command": "node",
    "args": ["/path/to/harperslone/mcp-server/index.js"]
  }
}
```

## Available Tools

- `get_portfolio_info` - Get complete portfolio information
- `get_services` - List all services offered
- `search_portfolio` - Search for specific information

## Available Resources

- `portfolio://info` - Basic portfolio information
- `portfolio://services` - Services list
- `portfolio://categories` - Project categories

## License

MIT

