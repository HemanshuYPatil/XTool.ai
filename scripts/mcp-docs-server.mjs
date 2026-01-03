import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const PORT = Number(process.env.MCP_DOCS_PORT || process.env.PORT || 8787);
const ROOT_DIR = process.env.MCP_DOCS_ROOT
  ? path.resolve(process.env.MCP_DOCS_ROOT)
  : process.cwd();

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "dist",
  "build",
  "coverage",
]);

function isIgnoredDir(dirName) {
  return IGNORED_DIRS.has(dirName);
}

function isMarkdown(fileName) {
  return fileName.toLowerCase().endsWith(".md");
}

function walkMarkdownFiles(dir, results) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (isIgnoredDir(entry.name)) continue;
      walkMarkdownFiles(fullPath, results);
      continue;
    }
    if (entry.isFile() && isMarkdown(entry.name)) {
      results.push(fullPath);
    }
  }
}

function normalizeRelativePath(filePath) {
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
}

function loadDocsIndex() {
  const files = [];
  walkMarkdownFiles(ROOT_DIR, files);

  const docs = new Map();
  for (const filePath of files) {
    const text = fs.readFileSync(filePath, "utf8");
    const relativePath = normalizeRelativePath(filePath);
    const uri = `docs:///${relativePath}`;
    docs.set(uri, {
      uri,
      title: path.basename(relativePath),
      path: relativePath,
      text,
    });
  }

  return docs;
}

function createExcerpt(text, index, maxLength = 300) {
  const start = Math.max(0, index - Math.floor(maxLength / 2));
  const end = Math.min(text.length, start + maxLength);
  const excerpt = text.slice(start, end).replace(/\s+/g, " ").trim();
  return excerpt;
}

function scoreDoc(text, tokens) {
  let score = 0;
  let firstIndex = -1;
  for (const token of tokens) {
    const idx = text.indexOf(token);
    if (idx === -1) continue;
    score += 1;
    if (firstIndex === -1 || idx < firstIndex) {
      firstIndex = idx;
    }
  }
  return { score, firstIndex };
}

function searchDocs(docsIndex, query, maxResults = 5) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const results = [];

  for (const doc of docsIndex.values()) {
    const text = doc.text.toLowerCase();
    const { score, firstIndex } = scoreDoc(text, tokens);
    if (score === 0) continue;
    const excerpt = createExcerpt(doc.text, firstIndex);
    results.push({
      uri: doc.uri,
      title: doc.title,
      score,
      excerpt,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

const docsIndex = loadDocsIndex();
const transports = new Map();
const servers = new Map();

function createServer() {
  const server = new McpServer({
    name: "xtool-docs",
    version: "1.0.0",
  });

  server.resource("doc", "docs:///{path}", async (uri) => {
    const key = typeof uri === "string" ? uri : uri?.href ?? "";
    const doc = docsIndex.get(key);
    if (!doc) {
      throw new Error(`Unknown document: ${key}`);
    }
    return {
      contents: [
        {
          uri: doc.uri,
          mimeType: "text/markdown",
          text: doc.text,
        },
      ],
    };
  });

  server.tool(
    "search_docs",
    {
      query: z.string().min(1),
      maxResults: z.number().int().min(1).max(20).optional(),
    },
    async ({ query, maxResults }) => {
      const results = searchDocs(docsIndex, query, maxResults ?? 5);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ results }),
          },
        ],
      };
    }
  );

  return server;
}

const httpServer = http.createServer(async (req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end("Missing URL");
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (requestUrl.pathname === "/mcp" && req.method === "GET") {
    try {
      const transport = new SSEServerTransport("/messages", res);
      const sessionId = transport.sessionId;
      transports.set(sessionId, transport);

      const server = createServer();
      servers.set(sessionId, server);

      transport.onclose = () => {
        transports.delete(sessionId);
        servers.delete(sessionId);
      };

      await server.connect(transport);
      return;
    } catch (error) {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Error establishing SSE stream.");
      }
      return;
    }
  }

  if (requestUrl.pathname === "/messages" && req.method === "POST") {
    const sessionId = requestUrl.searchParams.get("sessionId");
    if (!sessionId) {
      res.statusCode = 400;
      res.end("Missing sessionId parameter.");
      return;
    }

    const transport = transports.get(sessionId);
    if (!transport) {
      res.statusCode = 404;
      res.end("Session not found.");
      return;
    }

    try {
      await transport.handlePostMessage(req, res);
      return;
    } catch {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Error handling request.");
      }
      return;
    }
  }

  if (req.url === "/healthz") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.statusCode = 404;
  res.end("Not found");
});

httpServer.listen(PORT, () => {
  const rootLabel = ROOT_DIR === process.cwd() ? "." : ROOT_DIR;
  console.log(`MCP docs server listening on http://localhost:${PORT}/mcp`);
  console.log(`Indexing markdown files under ${rootLabel}`);
});
