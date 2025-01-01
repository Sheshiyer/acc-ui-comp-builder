#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  Request,
} from '@modelcontextprotocol/sdk/types.js';

// Component type definitions
interface ComponentInfo {
  category: string;
  description: string;
  useCase: string;
  params: string[];
}

interface ComponentCatalog {
  [key: string]: ComponentInfo;
}

// Component catalog with descriptions and use cases
const COMPONENTS: ComponentCatalog = {
  // Hero Sections
  'wavy-background': {
    category: 'Hero Sections',
    description: 'A hero section with an animated wavy background effect',
    useCase: 'Landing pages that need a dynamic, eye-catching header',
    params: ['title', 'subtitle', 'ctaText']
  },
  'bento-grid': {
    category: 'Hero Sections',
    description: 'A modern bento grid layout for showcasing multiple items',
    useCase: 'Feature highlights, portfolio displays, or product showcases',
    params: ['items']
  },
  'typewriter-effect': {
    category: 'Hero Sections',
    description: 'Text animation that simulates typing',
    useCase: 'Dynamic text presentations or landing pages',
    params: ['words']
  },

  // Cards
  'netflix-card': {
    category: 'Cards',
    description: 'Card with Netflix-style hover animation',
    useCase: 'Content previews, featured items, or portfolio pieces',
    params: ['title', 'description', 'imageUrl']
  },
  'animated-tooltip': {
    category: 'Cards',
    description: 'Card with animated tooltip on hover',
    useCase: 'Information cards, feature explanations',
    params: ['text', 'tooltipText']
  },

  // Navigation
  'sticky-header': {
    category: 'Navigation',
    description: 'Header that sticks to top with scroll animations',
    useCase: 'Main website navigation',
    params: ['logo', 'menuItems']
  },
  'mac-dock': {
    category: 'Navigation',
    description: 'MacOS-style dock menu with hover effects',
    useCase: 'Creative navigation menus, app interfaces',
    params: ['items']
  },

  // Buttons
  'moving-border': {
    category: 'Buttons',
    description: 'Button with animated moving border',
    useCase: 'Call-to-action buttons, submit buttons',
    params: ['text', 'borderColor']
  },
  'sparkles-button': {
    category: 'Buttons',
    description: 'Button with sparkle animation effects',
    useCase: 'Primary actions, special feature buttons',
    params: ['text']
  },

  // Text Effects
  'text-gradient': {
    category: 'Text Effects',
    description: 'Text with animated gradient background',
    useCase: 'Headlines, section titles',
    params: ['text', 'gradientColors']
  },
  'glowing-text': {
    category: 'Text Effects',
    description: 'Text with dynamic glowing animation',
    useCase: 'Emphasis text, decorative headlines',
    params: ['text', 'glowColor']
  }
};

class AceternityUIServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'aceternity-ui',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error: Error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_components',
          description: 'List all available Aceternity UI components with descriptions',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Optional category filter'
              }
            }
          }
        },
        {
          name: 'get_component_code',
          description: 'Get the implementation code for a specific component',
          inputSchema: {
            type: 'object',
            properties: {
              componentName: {
                type: 'string',
                description: 'Name of the component'
              },
              customizations: {
                type: 'object',
                description: 'Component-specific customization parameters'
              }
            },
            required: ['componentName']
          }
        },
        {
          name: 'suggest_component',
          description: 'Get component suggestions based on use case',
          inputSchema: {
            type: 'object',
            properties: {
              useCase: {
                type: 'string',
                description: 'Description of the intended use'
              }
            },
            required: ['useCase']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: Request) => {
      if (!request.params) {
        throw new McpError(ErrorCode.InvalidRequest, 'Missing request parameters');
      }

      const args = request.params.arguments as Record<string, unknown> || {};
      
      switch (request.params.name) {
        case 'list_components':
          return this.handleListComponents({
            category: typeof args['category'] === 'string' ? args['category'] : undefined
          });
        case 'get_component_code':
          return this.handleGetComponentCode({
            componentName: String(args['componentName']),
            customizations: args['customizations'] && typeof args['customizations'] === 'object' && args['customizations'] !== null ? args['customizations'] as Record<string, unknown> : undefined
          });
        case 'suggest_component':
          return this.handleSuggestComponent({
            useCase: String(args['useCase'])
          });
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private handleListComponents(args: { category?: string }) {
    const category = args?.category;
    let components = Object.entries(COMPONENTS);
    
    if (category) {
      components = components.filter(([_, info]) => info.category === category);
    }

    const formattedList = components.map(([name, info]) => ({
      name,
      ...info
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(formattedList, null, 2)
        }
      ]
    };
  }

  private handleGetComponentCode(args: { componentName: string; customizations?: Record<string, any> }) {
    if (!args.componentName || typeof args.componentName !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'Component name is required');
    }

    const component = COMPONENTS[args.componentName];
    if (!component) {
      throw new McpError(ErrorCode.InvalidParams, `Component "${args.componentName}" not found`);
    }

    // Here we would fetch and return the actual component code
    // For now, returning a placeholder
    return {
      content: [
        {
          type: 'text',
          text: `// Component code for ${args.componentName}\n// Import from aceternity-ui\nimport { ${args.componentName} } from "aceternity-ui";\n\n// Usage example with customizations:\n${JSON.stringify(args.customizations || {}, null, 2)}`
        }
      ]
    };
  }

  private handleSuggestComponent(args: { useCase: string }) {
    if (!args.useCase || typeof args.useCase !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'Use case description is required');
    }

    const useCase = args.useCase.toLowerCase();
    const suggestions = Object.entries(COMPONENTS)
      .filter(([_, info]) => {
        const relevantText = `${info.description} ${info.useCase}`.toLowerCase();
        return relevantText.includes(useCase);
      })
      .map(([name, info]) => ({
        name,
        ...info
      }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(suggestions, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Aceternity UI MCP server running on stdio');
  }
}

const server = new AceternityUIServer();
server.run().catch(console.error);
