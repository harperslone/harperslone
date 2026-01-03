import { NextResponse } from 'next/server'

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Harper Slone Designs API",
      description: "API for accessing Harper Slone's portfolio and project information",
      version: "1.0.0",
      contact: {
        name: "Harper Slone",
        url: "https://www.harperslone.com",
      },
    },
    servers: [
      {
        url: "https://www.harperslone.com/api",
        description: "Production server",
      },
    ],
    paths: {
      "/portfolio": {
        get: {
          operationId: "getPortfolio",
          summary: "Get portfolio information",
          description: "Returns information about Harper Slone's portfolio and services",
          responses: {
            "200": {
              description: "Portfolio information",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      title: { type: "string" },
                      location: { type: "string" },
                      services: { type: "array", items: { type: "string" } },
                      categories: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/projects": {
        get: {
          operationId: "getProjects",
          summary: "Get list of projects",
          description: "Returns a list of all projects in the portfolio",
          responses: {
            "200": {
              description: "List of projects",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        slug: { type: "string" },
                        description: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }

  return NextResponse.json(openApiSpec)
}

