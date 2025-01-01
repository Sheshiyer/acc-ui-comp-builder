# Aceternity UI Component Builder MCP Server

An MCP (Model Context Protocol) server that provides tools for working with Aceternity UI components. This server enables seamless integration of Aceternity UI components into projects through Claude's MCP capabilities.

## Features

- List available Aceternity UI components with descriptions
- Get implementation code for specific components
- Receive component suggestions based on use cases
- Customize components with specific parameters

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Build the project:
```bash
npm run build
```

## Usage

Add the server to your MCP settings configuration file:

```json
{
  "mcpServers": {
    "aceternity-ui": {
      "command": "node",
      "args": ["/path/to/acc-ui-comp builder/build/index.js"]
    }
  }
}
```

## Available Tools

### list_components
Lists all available Aceternity UI components with descriptions. Optionally filter by category.

### get_component_code
Get the implementation code for a specific component with optional customizations.

### suggest_component
Get component suggestions based on your use case description.

## Development

- Build: `npm run build`
- Watch mode: `npm run watch`
- Start server: `npm run start`

## Dependencies

- @modelcontextprotocol/sdk: ^0.6.0
- axios: ^1.6.2

## License

MIT
