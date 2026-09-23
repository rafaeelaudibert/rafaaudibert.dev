import type { ImageMetadata } from "astro"
import posthog from "../assets/companies/posthog.svg"
import posthogDark from "../assets/companies/posthog-dark.svg"
import leadsimple from "../assets/companies/leadsimple.png"
import taglivros from "../assets/companies/taglivros.png"
import feeng from "../assets/companies/feeng.png"
import type { PAST_EXPERIENCES } from "./resume"

type Company = (typeof PAST_EXPERIENCES)[number]["company"]

/**
 * Logos keyed by company name from PAST_EXPERIENCES. Kept apart from the
 * resume data so that file stays importable outside the Astro build.
 */
export const COMPANY_LOGOS: Record<Company, ImageMetadata> = {
  PostHog: posthog,
  LeadSimple: leadsimple,
  "TAG Livros": taglivros,
  "FEENG/UFRGS": feeng,
}

/** Variants for dark mode, for logos that would disappear on a dark background. */
export const COMPANY_LOGOS_DARK: Partial<Record<Company, ImageMetadata>> = {
  PostHog: posthogDark,
}
