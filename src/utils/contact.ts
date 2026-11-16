/**
 * Shared by the email composer (EmailComposer.astro) and the Worker route that
 * delivers what it writes (worker/contact.ts), so both agree on what a valid
 * message is.
 */

export const CONTACT_PATH = "/api/contact"

/** Where the composer points people when it can't send: the plain mail app. */
export const CONTACT_MAILTO = "mailto:me@rafaaudibert.dev"

/**
 * Cloudflare's always-pass Turnstile test site key. Local servers use it, so
 * it pairs with the test secret in .dev.vars; the real widget's key comes from
 * the TURNSTILE_SITE_KEY build variable (astro.config.mjs).
 */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA"

/** Sent to Turnstile with the challenge and checked again by the Worker. */
export const TURNSTILE_ACTION = "contact"

export const MAX_EMAIL_LENGTH = 254
export const MAX_SUBJECT_LENGTH = 150
export const MAX_MESSAGE_LENGTH = 5000

// One @, a dot after it, and none of the characters that separate addresses or
// wrap names in a mail header. Whether it is a real inbox only a reply can tell.
const ADDRESS_PART = String.raw`[^\s@<>()[\]\\,;:"\p{C}]+`
const EMAIL_ADDRESS = new RegExp(`^${ADDRESS_PART}@${ADDRESS_PART}\\.${ADDRESS_PART}$`, "u")

export function isEmailAddress(value: string) {
  return value.length <= MAX_EMAIL_LENGTH && EMAIL_ADDRESS.test(value)
}

/** True when there is something to read, not only spaces or invisible characters. */
export function hasText(value: string) {
  return /[^\s\p{Z}\p{C}]/u.test(value)
}
