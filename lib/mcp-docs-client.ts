import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

type SearchMatch = {
  uri: string;
  title: string;
  score: number;
  excerpt: string;
};

type SearchResponse = {
  results: SearchMatch[];
};

let clientPromise: Promise<Client> | null = null;

async function getClient() {
  if (clientPromise) return clientPromise;

  const serverUrl = process.env.MCP_DOCS_SERVER_URL;
  if (!serverUrl) {
    throw new Error("MCP_DOCS_SERVER_URL is not configured.");
  }

  clientPromise = (async () => {
    const client = new Client(
      { name: "xtool-docs-client", version: "1.0.0" },
      { capabilities: {} }
    );
    const transport = new SSEClientTransport(new URL(serverUrl));
    await client.connect(transport);
    return client;
  })();

  return clientPromise;
}

export async function searchDocs(query: string, maxResults = 6) {
  const client = await getClient();
  const response = await client.callTool({
    name: "search_docs",
    arguments: {
      query,
      maxResults,
    },
  });

  const contentText = response?.content?.[0]?.text ?? "";
  if (!contentText) return [];

  try {
    const parsed = JSON.parse(contentText) as SearchResponse;
    return parsed.results ?? [];
  } catch {
    return [];
  }
}
