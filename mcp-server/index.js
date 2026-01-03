import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Portfolio data
const portfolioData = {
  name: "Harper Slone",
  title: "Visual Artist & Photographer",
  location: "Paris, France",
  availability: "Available worldwide",
  website: "https://www.harperslone.com",
  services: [
    "Image & Photography",
    "Video Production",
    "Brand Identity Design",
    "Book & Magazine Design",
    "Print & Poster Design",
    "Retail Graphics",
    "Brand Strategy",
    "Content Direction",
    "Type Design",
    "Product Design",
    "Creative Direction",
    "Styling",
  ],
  categories: ["Projects", "Work", "Exhibitions", "Print"],
};

// Create server
const server = new Server(
  {
    name: "harperslone-portfolio",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "portfolio://info",
        name: "Portfolio Information",
        description: "Basic information about Harper Slone and their services",
        mimeType: "application/json",
      },
      {
        uri: "portfolio://services",
        name: "Services",
        description: "List of services offered by Harper Slone",
        mimeType: "application/json",
      },
      {
        uri: "portfolio://categories",
        name: "Project Categories",
        description: "Categories of work in the portfolio",
        mimeType: "application/json",
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "portfolio://info") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(portfolioData, null, 2),
        },
      ],
    };
  }

  if (uri === "portfolio://services") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ services: portfolioData.services }, null, 2),
        },
      ],
    };
  }

  if (uri === "portfolio://categories") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ categories: portfolioData.categories }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_portfolio_info",
        description: "Get information about Harper Slone's portfolio, services, and contact details",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_services",
        description: "Get the list of services offered by Harper Slone",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "search_portfolio",
        description: "Search for specific information in Harper Slone's portfolio",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (e.g., 'photography', 'brand design', 'paris')",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_portfolio_info") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(portfolioData, null, 2),
        },
      ],
    };
  }

  if (name === "get_services") {
    return {
      content: [
        {
          type: "text",
          text: `Harper Slone offers the following services:\n\n${portfolioData.services.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
        },
      ],
    };
  }

  if (name === "search_portfolio") {
    const query = (args?.query || "").toLowerCase();
    const results = [];

    // Search in services
    const matchingServices = portfolioData.services.filter((s) =>
      s.toLowerCase().includes(query)
    );
    if (matchingServices.length > 0) {
      results.push(`Services matching "${query}": ${matchingServices.join(", ")}`);
    }

    // Search in basic info
    if (portfolioData.location.toLowerCase().includes(query)) {
      results.push(`Location: ${portfolioData.location}`);
    }
    if (portfolioData.name.toLowerCase().includes(query)) {
      results.push(`Artist: ${portfolioData.name} - ${portfolioData.title}`);
    }

    // Search in categories
    const matchingCategories = portfolioData.categories.filter((c) =>
      c.toLowerCase().includes(query)
    );
    if (matchingCategories.length > 0) {
      results.push(`Categories matching "${query}": ${matchingCategories.join(", ")}`);
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No results found for "${query}". Try searching for services like "photography", "brand design", or "print".`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: results.join("\n\n"),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Harper Slone MCP Server running on stdio");
}

main().catch(console.error);

