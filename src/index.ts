import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Zod schemas for tool arguments
const SearchScriptureArgsSchema = z.object({
  query: z.string().describe("Search query for scripture"),
  version: z.string().optional().default("ESV").describe("Bible version (ESV, NIV, KJV, etc.)"),
  limit: z.number().optional().default(5).describe("Maximum number of results"),
});

const GetVerseArgsSchema = z.object({
  reference: z.string().describe("Verse reference (e.g., 'John 3:16')"),
  version: z.string().optional().default("ESV").describe("Bible version"),
});

// Type definitions
type SearchScriptureArgs = z.infer<typeof SearchScriptureArgsSchema>;
type GetVerseArgs = z.infer<typeof GetVerseArgsSchema>;

// Mock scripture database (in real implementation, this would connect to Olivetree API)
const mockScriptures: Record<string, Record<string, string>> = {
  "John 3:16": {
    ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
    NIV: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
  },
  "Genesis 1:1": {
    ESV: "In the beginning, God created the heavens and the earth.",
    NIV: "In the beginning God created the heavens and the earth.",
    KJV: "In the beginning God created the heaven and the earth.",
  },
  "Psalm 23:1": {
    ESV: "The LORD is my shepherd; I shall not want.",
    NIV: "The LORD is my shepherd, I lack nothing.",
    KJV: "The LORD is my shepherd; I shall not want.",
  },
};

// Create MCP server
const server = new Server(
  {
    name: "olivetree-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_scripture",
        description: "Search for scripture passages by keyword or topic",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for scripture",
            },
            version: {
              type: "string",
              description: "Bible version (ESV, NIV, KJV, etc.)",
              default: "ESV",
            },
            limit: {
              type: "number",
              description: "Maximum number of results",
              default: 5,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_verse",
        description: "Get a specific Bible verse by reference",
        inputSchema: {
          type: "object",
          properties: {
            reference: {
              type: "string",
              description: "Verse reference (e.g., 'John 3:16')",
            },
            version: {
              type: "string",
              description: "Bible version",
              default: "ESV",
            },
          },
          required: ["reference"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_scripture") {
      const validated = SearchScriptureArgsSchema.parse(args);
      const results = searchScripture(validated);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } else if (name === "get_verse") {
      const validated = GetVerseArgsSchema.parse(args);
      const verse = getVerse(validated);
      return {
        content: [
          {
            type: "text",
            text: verse || "Verse not found.",
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
});

// Search scripture function
function searchScripture(args: SearchScriptureArgs): Array<{ reference: string; text: string; version: string }> {
  const results: Array<{ reference: string; text: string; version: string }> = [];
  const query = args.query.toLowerCase();
  const version = args.version;

  for (const [reference, versions] of Object.entries(mockScriptures)) {
    const text = versions[version] || versions["ESV"];
    if (text.toLowerCase().includes(query) || reference.toLowerCase().includes(query)) {
      results.push({ reference, text, version });
    }
    if (results.length >= args.limit) break;
  }

  return results;
}

// Get verse function
function getVerse(args: GetVerseArgs): string | null {
  const versions = mockScriptures[args.reference];
  if (!versions) return null;
  return versions[args.version] || versions["ESV"] || null;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Olivetree MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
