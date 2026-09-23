/**
 * MCP server for rafaaudibert.dev, served at /mcp over Streamable HTTP.
 *
 * The server is stateless: every request builds a fresh McpServer and
 * transport, answers, and lets both go. There is no session id and nothing
 * is stored between calls, which is all a read-only server over static data
 * needs and keeps it off Durable Objects.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { CfWorkerJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/cfworker"

import { site } from "../../src/data/site"
import { BLOG_INDEX_PATH, type BlogIndexEntry } from "../../src/data/blogIndex"
import { ToolError, toolsFor, type ToolContext } from "./tools"

export interface McpEnv {
  ASSETS: Fetcher
  /**
   * Optional secret. When set and presented as a bearer token, the request is
   * treated as privileged. No private data is exposed yet; see tools.ts.
   */
  MCP_PRIVATE_KEY?: string
}

export const MCP_PATH = "/mcp"

// MCP clients that run in a browser (the MCP Inspector, web IDEs) need CORS.
// Everything here is public, so any origin may call it.
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept, authorization, mcp-session-id, mcp-protocol-version, last-event-id",
  "access-control-expose-headers": "mcp-session-id, mcp-protocol-version",
  "access-control-max-age": "86400",
}

const withCors = (response: Response) => {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value)
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

// The blog index is a build artifact, so it cannot change while this isolate
// is alive: a deploy replaces the isolate. Cache it for the isolate's lifetime.
let blogIndex: Promise<BlogIndexEntry[]> | undefined

const loadBlogIndex = (env: McpEnv, origin: string) => {
  blogIndex ??= env.ASSETS.fetch(new URL(BLOG_INDEX_PATH, origin)).then(async (response) => {
    if (!response.ok) {
      blogIndex = undefined
      throw new Error(`Blog index unavailable (${response.status})`)
    }
    return (await response.json()) as BlogIndexEntry[]
  })
  return blogIndex
}

const encoder = new TextEncoder()

/**
 * Constant-time comparison so the key cannot be guessed byte by byte. Every
 * byte is visited whether or not an earlier one already mismatched.
 */
function secretsMatch(candidate: string, secret: string): boolean {
  const a = encoder.encode(candidate)
  const b = encoder.encode(secret)
  let diff = a.byteLength ^ b.byteLength
  for (let i = 0; i < b.byteLength; i++) diff |= (a[i] ?? 0) ^ b[i]!
  return diff === 0
}

function isPrivileged(request: Request, env: McpEnv): boolean {
  if (!env.MCP_PRIVATE_KEY) return false
  const header = request.headers.get("authorization") ?? ""
  const token = header.replace(/^Bearer\s+/i, "")
  return secretsMatch(token, env.MCP_PRIVATE_KEY)
}

export function createMcpServer(ctx: ToolContext): McpServer {
  const server = new McpServer(
    { name: site.domain, title: `${site.name}'s personal MCP server`, version: "1.0.0" },
    {
      // Ajv, the SDK default, compiles schemas with `new Function`, which the
      // Workers runtime forbids. This validator interprets schemas instead.
      jsonSchemaValidator: new CfWorkerJsonSchemaValidator(),
      instructions: [
        `Public information about ${site.name} (${site.fullName}), ${site.tagline}.`,
        `Everything here mirrors ${site.url}: profile, resume, travel history and blog posts.`,
        "All tools are read-only. Call get_profile first for an overview.",
      ].join(" "),
    }
  )

  for (const tool of toolsFor(ctx.privileged)) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      },
      async (args) => {
        try {
          const result = await tool.handler(args, ctx)
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
          if (error instanceof ToolError) {
            return { isError: true, content: [{ type: "text", text: error.message }] }
          }
          throw error
        }
      }
    )
  }

  server.registerResource(
    "llms.txt",
    `${site.url}/llms.txt`,
    {
      title: "llms.txt",
      description: "A plain-text overview of the site and its owner, in the llms.txt convention.",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/plain", text: await ctx.loadLlmsTxt() }],
    })
  )

  return server
}

export async function handleMcpRequest(request: Request, env: McpEnv): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (request.method === "GET" || request.method === "HEAD") {
    // MCP clients may open a GET stream (Accept: text/event-stream) to
    // receive server-initiated messages. A stateless server has none to
    // send, and the spec allows declining with 405 rather than holding an
    // idle stream open.
    const accept = request.headers.get("accept") ?? ""
    if (accept.includes("text/event-stream")) {
      return new Response("This server is stateless and does not push messages. POST JSON-RPC to this URL.", {
        status: 405,
        headers: { ...CORS_HEADERS, allow: "POST, OPTIONS" },
      })
    }
    // Anyone else on GET is a browser: hand back the docs page the Astro
    // build produced at /mcp/.
    return env.ASSETS.fetch(request)
  }

  const origin = new URL(request.url).origin
  const ctx: ToolContext = {
    privileged: isPrivileged(request, env),
    loadBlogIndex: () => loadBlogIndex(env, origin),
    loadLlmsTxt: () => env.ASSETS.fetch(new URL("/llms.txt", origin)).then((r) => r.text()),
  }

  const server = createMcpServer(ctx)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  })
  await server.connect(transport)

  try {
    return withCors(await transport.handleRequest(request))
  } finally {
    // The response body has been produced by now (JSON mode), so nothing is
    // cut short. This just releases the per-request server.
    void transport.close()
  }
}
