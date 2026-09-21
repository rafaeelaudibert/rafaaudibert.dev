/**
 * Worker entry point.
 *
 * Almost every request is a static asset and never reaches this code - the
 * assets binding serves those directly. This exists for:
 *
 * - /api/sorting/*, which runs the sorting algorithms server-side for the
 *   sorting-algorithms posts.
 * - /mcp, the MCP server (see ./mcp/server.ts). wrangler.jsonc routes that
 *   path here first, so POST reaches the server while a browser GET is
 *   handed back to the assets binding and gets the docs page.
 *
 * The response deliberately carries no timing. Workers freeze the clock during
 * synchronous execution as a Spectre mitigation, so any duration measured in
 * here would be 0 regardless of how much work happened. The browser times the
 * round trip instead, which is honest as long as the UI says it includes
 * network latency.
 */

import {
  buildArray,
  runSort,
  type ArrayType,
  type ShellSequence,
  type SortingAlgorithm,
} from "../src/content/blog/sorting-algorithms/sorting"
import { handleMcpRequest, MCP_PATH, type McpEnv } from "./mcp/server"

interface Env extends McpEnv {
  ASSETS: Fetcher
}

const ALGORITHMS: SortingAlgorithm[] = [
  "bubble-sort",
  "insertion-sort",
  "binary-insertion-sort",
  "shell-sort",
  "quick-sort",
  "merge-sort",
  "radix-sort",
]

const ARRAY_TYPES: ArrayType[] = ["sorted", "reversed", "random", "custom"]

/**
 * Workers cap CPU time per request, and the quadratic algorithms blow through
 * it quickly - bubble sort is ~n²/2 operations.
 *
 * Measured against the deployed Worker with the worst case (bubble sort over a
 * reversed array): 35,000 completed in ~2.1s, 40,000 died with error 1102.
 * 25,000 lands at ~1.2s, which leaves headroom for load variance and fails
 * with a readable message rather than an opaque 1102.
 */
const MAX_SIZE = 25_000
const MAX_CUSTOM_LENGTH = 10_000

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Every run is a fresh measurement; caching would silently serve stale numbers.
      "cache-control": "no-store",
    },
  })

function handleSort(url: URL): Response {
  // /api/sorting/{arrayType}/{algorithm}
  const parts = url.pathname.replace(/^\/api\/sorting\/?/, "").split("/").filter(Boolean)
  if (parts.length !== 2) {
    return json({ error: "Expected /api/sorting/{arrayType}/{algorithm}" }, 404)
  }

  const [arrayType, algorithm] = parts as [ArrayType, SortingAlgorithm]
  if (!ARRAY_TYPES.includes(arrayType)) {
    return json({ error: `Unknown array type "${arrayType}"` }, 400)
  }
  if (!ALGORITHMS.includes(algorithm)) {
    return json({ error: `Unknown algorithm "${algorithm}"` }, 400)
  }

  const shellType = (url.searchParams.get("type") || "0") as ShellSequence
  if (!["0", "1", "2"].includes(shellType)) {
    return json({ error: `Unknown shell sequence "${shellType}"` }, 400)
  }

  let custom: number[] = []
  if (arrayType === "custom") {
    custom = (url.searchParams.get("array") || "")
      .split(",")
      .map((x) => Number.parseInt(x, 10))
      .filter((x) => Number.isFinite(x))
    if (custom.length === 0) {
      return json({ error: "custom requires ?array=1,2,3" }, 400)
    }
    if (custom.length > MAX_CUSTOM_LENGTH) {
      return json({ error: `custom array is limited to ${MAX_CUSTOM_LENGTH} values` }, 413)
    }
  }

  let size = Number.parseInt(url.searchParams.get("size") || "100", 10)
  if (!Number.isFinite(size) || size < 1) size = 100
  if (arrayType !== "custom" && size > MAX_SIZE) {
    return json(
      { error: `size is limited to ${MAX_SIZE}; the quadratic algorithms exceed the Worker CPU limit above that` },
      413,
    )
  }

  const array = buildArray(arrayType, size, custom)
  const { changes } = runSort(algorithm, array, shellType)

  return json({
    algorithm,
    arrayType,
    shellType: algorithm === "shell-sort" ? shellType : undefined,
    size: array.length,
    changes,
    sorted: array.every((v, i) => i === 0 || array[i - 1] <= v),
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === MCP_PATH || url.pathname === `${MCP_PATH}/`) {
      return handleMcpRequest(request, env)
    }

    if (url.pathname.startsWith("/api/sorting")) {
      if (request.method !== "GET") {
        return json({ error: "Method not allowed" }, 405)
      }
      try {
        return handleSort(url)
      } catch (error) {
        return json({ error: String(error) }, 500)
      }
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
