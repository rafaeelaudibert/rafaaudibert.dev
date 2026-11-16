/**
 * POST /api/contact: the email composer's endpoint (src/components/EmailComposer.astro).
 *
 * The endpoint is public and everything it accepts lands in my inbox, so it
 * only listens to this site's own pages, asks Turnstile whether a person sent
 * the request, bounds the body and every field, and limits how often one
 * visitor, and everyone together, can write.
 *
 * The mail goes out through the send_email binding (Cloudflare Email Service).
 * Sending to a verified Email Routing destination address is free, so the
 * recipient is CONTACT_TO (a var in wrangler.jsonc). The sender is fixed on
 * this domain and the visitor's address is only the Reply-To: nobody can make
 * the form send as someone else or to someone else.
 */

import { site } from "../src/data/site"
import {
  MAX_MESSAGE_LENGTH,
  MAX_SUBJECT_LENGTH,
  TURNSTILE_ACTION,
  hasText,
  isEmailAddress,
} from "../src/utils/contact"

export interface ContactEnv {
  /** The send_email binding. */
  CONTACT_EMAIL: SendEmail
  /** Per visitor, keyed by network. Optional so a missing binding never blocks mail. */
  CONTACT_VISITOR_LIMIT?: RateLimit
  /** Everyone together: however many visitors there are, the inbox only takes this many. */
  CONTACT_GLOBAL_LIMIT?: RateLimit
  /** The verified destination address the form delivers to (wrangler.jsonc vars). */
  CONTACT_TO?: string
  /** Secret: the Turnstile widget's secret key. */
  TURNSTILE_SECRET_KEY?: string
}

const SENDER = { name: site.domain, email: `contact@${site.domain}` }
const MAX_BODY_BYTES = 20_000
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

const reply = (body: Record<string, unknown>, status = 200, headers?: HeadersInit) =>
  Response.json(body, {
    status,
    headers: { "cache-control": "no-store", ...headers },
  })

const fail = (error: string, status: number, headers?: HeadersInit) => reply({ error }, status, headers)

/**
 * Browsers say where a request came from. Another site's page could post here
 * through its own visitors, so only this site's pages are let in. Anything
 * that isn't a browser sends neither header and is left to Turnstile.
 */
function isFromAnotherSite(request: Request, url: URL) {
  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite) return fetchSite !== "same-origin"

  const origin = request.headers.get("origin")
  if (!origin) return false

  try {
    return new URL(origin).host !== url.host
  } catch {
    return true
  }
}

/** Reads the body up to a limit, and stops listening the moment it's passed. */
async function readBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) return null

  const reader = request.body?.getReader()
  if (!reader) return ""

  const decoder = new TextDecoder()
  let text = ""
  let size = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) return text + decoder.decode()

    size += value.byteLength
    if (size > limit) {
      await reader.cancel()
      return null
    }

    text += decoder.decode(value, { stream: true })
  }
}

function readField(payload: Record<string, unknown>, name: string) {
  const value = payload[name]
  return typeof value === "string" ? value.trim() : ""
}

/**
 * The network an address belongs to: the address itself for IPv4, the /64 for
 * IPv6. One IPv6 connection is handed billions of addresses, so counting each
 * one separately would let a single visitor never run out.
 */
export function networkOf(address: string) {
  const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)
  if (mapped) return mapped[1]
  if (!address.includes(":")) return address

  const [head, tail] = address.toLowerCase().split("::")
  const leading = head ? head.split(":") : []
  const trailing = tail ? tail.split(":") : []
  // "::" stands for however many zero groups are missing from the eight
  const groups =
    tail === undefined
      ? leading
      : [...leading, ...Array(Math.max(0, 8 - leading.length - trailing.length)).fill("0"), ...trailing]

  return `${groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ""))
    .join(":")}::/64`
}

interface SiteverifyOutcome {
  success: boolean
  hostname?: string
  action?: string
  "error-codes"?: string[]
}

/**
 * Asks Turnstile whether the token came from a person on this site. Tokens
 * are single use and last five minutes, so the composer fetches a new one
 * after every attempt.
 */
async function verifyTurnstile(token: string, secret: string, ip: string, url: URL) {
  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      secret,
      response: token,
      remoteip: ip,
      idempotency_key: crypto.randomUUID(),
    }),
  })

  if (!response.ok) return false
  const outcome = (await response.json()) as SiteverifyOutcome
  if (!outcome.success) return false

  // Cloudflare's test secrets answer for "example.com" with no action, so the
  // widget and host checks only mean something with a real secret
  const isTestSecret = /^[123]x0+AA$/.test(secret)
  if (isTestSecret) return true

  return outcome.action === TURNSTILE_ACTION && outcome.hostname === url.hostname
}

export async function handleContact(request: Request, env: ContactEnv): Promise<Response> {
  const url = new URL(request.url)

  if (request.method !== "POST") {
    return fail("Method not allowed.", 405, { allow: "POST" })
  }

  if (isFromAnotherSite(request, url)) {
    return fail(`This form only works from ${site.domain}.`, 403)
  }

  // A page on another site can post plain text or a form without asking
  // first. JSON it has to ask for, and nothing here says yes.
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase()
  if (type !== "application/json") {
    return fail("Expected JSON.", 415)
  }

  const body = await readBody(request, MAX_BODY_BYTES)
  if (body === null) {
    return fail("That message is too long.", 413)
  }

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return fail("Expected JSON.", 400)
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return fail("Expected JSON.", 400)
  }

  const fields = payload as Record<string, unknown>

  // A field people never see. Whatever fills it in gets a thank-you and no email.
  if (readField(fields, "fax")) {
    return reply({ ok: true })
  }

  const from = readField(fields, "from")
  // Headers are one line each
  const subject = readField(fields, "subject").replace(/\s+/g, " ")
  const message = readField(fields, "message")
  const token = readField(fields, "token")

  if (!isEmailAddress(from)) {
    return fail("That email address doesn't look right.", 400)
  }

  if (!hasText(message)) {
    return fail("Write a message first.", 400)
  }

  if (message.length > MAX_MESSAGE_LENGTH || subject.length > MAX_SUBJECT_LENGTH) {
    return fail("That message is too long.", 400)
  }

  if (!env.TURNSTILE_SECRET_KEY || !env.CONTACT_TO) {
    console.error("TURNSTILE_SECRET_KEY or CONTACT_TO is not set, so the email form can't send.")
    return fail("Email isn't set up here yet.", 503)
  }

  if (!token) {
    return fail("Couldn't confirm you're a person. Try sending again.", 403)
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown"

  // Counted before Turnstile so a flood never reaches siteverify. The limits
  // are per Cloudflare location and eventually consistent: a brake, not a wall
  const visitor = await env.CONTACT_VISITOR_LIMIT?.limit({ key: networkOf(ip) })
  if (visitor && !visitor.success) {
    return fail("That's a lot of emails. Try again in a minute.", 429, { "retry-after": "60" })
  }

  const everyone = await env.CONTACT_GLOBAL_LIMIT?.limit({ key: "everyone" })
  if (everyone && !everyone.success) {
    console.error("The email form reached its ceiling and is turning emails away.")
    return fail("The inbox is full for now. Try again in a minute.", 429, { "retry-after": "60" })
  }

  if (!(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip, url))) {
    return fail("Couldn't confirm you're a person. Try sending again.", 403)
  }

  try {
    await env.CONTACT_EMAIL.send({
      from: SENDER,
      to: env.CONTACT_TO,
      // Replying from the inbox answers the person who wrote
      replyTo: from,
      // The subject says first that it came through the form, and so does the
      // body before any of the visitor's words
      subject: `[${site.domain}] ${subject || "New message"}`,
      text: [
        `Sent through the email form on ${site.domain}.`,
        `The sender typed their own address and nothing checked it: ${from}`,
        "",
        message,
      ].join("\n"),
    })
  } catch (error) {
    console.error("The send_email binding rejected the email form's message:", error)
    return fail("The email didn't go through.", 502)
  }

  return reply({ ok: true })
}
