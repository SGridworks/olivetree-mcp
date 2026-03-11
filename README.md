# Olivetree MCP Server

A Model Context Protocol (MCP) server for integrating Olivetree Bible functionality with AI assistants.

## Overview

This MCP server provides tools for searching and retrieving Bible scripture. It implements the Model Context Protocol to allow AI assistants to access Bible content programmatically.

## Features

- **Search Scripture**: Search for Bible passages by keyword or topic
- **Get Verse**: Retrieve specific verses by reference (e.g., "John 3:16")
- **Multiple Versions**: Support for ESV, NIV, KJV, and more

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

1. Clone or download this repository:
```bash
git clone <repository-url>
cd olivetree-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript source:
```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

Or for development with auto-rebuild:
```bash
npm run dev
```

### MCP Configuration

Add this server to your MCP client configuration:

```json
{
  "mcpServers": {
    "olivetree": {
      "command": "node",
      "args": ["/path/to/olivetree-mcp/dist/index.js"]
    }
  }
}
```

### Available Tools

#### search_scripture

Search for scripture passages by keyword or topic.

**Parameters:**
- `query` (string, required): Search query for scripture
- `version` (string, optional): Bible version (ESV, NIV, KJV, etc.). Default: "ESV"
- `limit` (number, optional): Maximum number of results. Default: 5

**Example:**
```json
{
  "query": "love",
  "version": "ESV",
  "limit": 3
}
```

#### get_verse

Get a specific Bible verse by reference.

**Parameters:**
- `reference` (string, required): Verse reference (e.g., "John 3:16")
- `version` (string, optional): Bible version. Default: "ESV"

**Example:**
```json
{
  "reference": "John 3:16",
  "version": "NIV"
}
```

## Development

### Project Structure

```
olivetree-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Building

```bash
npm run build
```

### Testing

Currently, no tests are implemented. To add tests:

```bash
npm test
```

## Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for building servers
- `zod`: Schema validation for tool arguments
- `typescript`: TypeScript compiler (dev)
- `@types/node`: Node.js type definitions (dev)

## License

MIT

## Notes

This is a demonstration MCP server with mock scripture data. For production use, integrate with the actual Olivetree Bible API or another Bible API service.
