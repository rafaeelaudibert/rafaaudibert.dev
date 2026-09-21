/**
 * Tool definitions for the MCP server.
 *
 * Every tool reads from the same modules the site is built from
 * (src/data/*), so the answers an assistant gets here are the answers a
 * visitor gets on the page. Blog posts are the one exception: they live in
 * the Astro content collection, so the build writes them to BLOG_INDEX_PATH
 * and tools read that back through the assets binding.
 *
 * This module is also imported by the /mcp docs page, which lists the tools
 * from these definitions. Keep it free of Worker-only globals.
 */

import { z } from "zod"

import { site, SOCIAL_LINKS } from "../../src/data/site"
import {
  EDUCATION_AND_ACHIEVEMENTS,
  getBackgroundContent,
  LANGUAGES,
  PAST_EXPERIENCES,
  TECHNOLOGIES,
  yearsOfExperience,
} from "../../src/data/resume"
import {
  AIRPORTS,
  FLIGHTS,
  getVisitedCountriesTimeline,
  type AirportCode,
  type CountryCode,
} from "../../src/data/travel"
import { COUNTRY_CODE_TO_LONG_NAME, countryCodeToFlag } from "../../src/data/countries"
import type { BlogIndexEntry } from "../../src/data/blogIndex"
import { htmlToMarkdown } from "./text"

export type ToolContext = {
  loadBlogIndex: () => Promise<BlogIndexEntry[]>
  loadLlmsTxt: () => Promise<string>
  /**
   * True when the request carried the private key. No tool uses it yet; it
   * is the hook for exposing non-public information later.
   */
  privileged: boolean
}

export type ToolDefinition<Shape extends z.ZodRawShape = z.ZodRawShape> = {
  name: string
  title: string
  description: string
  inputSchema: Shape
  /** Only registered for privileged requests. Nothing is private yet. */
  private?: boolean
  handler: (
    args: z.infer<z.ZodObject<Shape>>,
    ctx: ToolContext
  ) => Promise<unknown> | unknown
}

const defineTool = <Shape extends z.ZodRawShape>(tool: ToolDefinition<Shape>) =>
  tool as unknown as ToolDefinition

export class ToolError extends Error {}

const HOME_COUNTRY: CountryCode = "BR"

const describeAirport = (code: AirportCode) => {
  const airport = AIRPORTS[code]
  return {
    code: airport.code,
    name: airport.name,
    country: COUNTRY_CODE_TO_LONG_NAME[airport.countryCode],
    countryCode: airport.countryCode,
  }
}

const describeCountry = (code: CountryCode) => ({
  code,
  name: COUNTRY_CODE_TO_LONG_NAME[code],
  flag: countryCodeToFlag(code),
})

const currentExperience = PAST_EXPERIENCES.find((e) => e.endDate === "Present")

const getProfile = defineTool({
  name: "get_profile",
  title: "Profile",
  description:
    "Who Rafa Audibert is in one call: name, headline, location, current job, website and social links. Start here.",
  inputSchema: {},
  handler: () => ({
    name: site.name,
    fullName: site.fullName,
    tagline: site.tagline,
    location: site.location,
    yearsOfExperience: yearsOfExperience(),
    currentRole: currentExperience && {
      role: currentExperience.role,
      company: currentExperience.company,
      companyUrl: currentExperience.href,
      since: currentExperience.startDate,
    },
    website: site.url,
    links: SOCIAL_LINKS.map(({ label, href }) => ({ label, href })),
  }),
})

const RESUME_SECTIONS = ["background", "experience", "education", "languages", "technologies"] as const

const getResume = defineTool({
  name: "get_resume",
  title: "Resume",
  description:
    "Rafa's resume, the same content as rafaaudibert.dev/resume: background, work experience with bullet points, education and achievements, spoken languages, and technologies. Optionally narrow to one section.",
  inputSchema: {
    section: z
      .enum(RESUME_SECTIONS)
      .optional()
      .describe("Return only this section. Omit for the whole resume."),
  },
  handler: ({ section }) => {
    const resume = {
      background: getBackgroundContent().map(htmlToMarkdown),
      experience: PAST_EXPERIENCES.map((experience) => ({
        company: experience.company,
        companyUrl: experience.href,
        role: experience.role,
        startDate: experience.startDate,
        endDate: experience.endDate,
        highlights: experience.bulletPoints.map(htmlToMarkdown),
      })),
      education: EDUCATION_AND_ACHIEVEMENTS.map((entry) => ({
        year: entry.year,
        description: htmlToMarkdown(entry.description),
      })),
      languages: LANGUAGES,
      technologies: TECHNOLOGIES.map((group) => ({
        category: group.type,
        items: group.technologies,
      })),
    }
    return section ? { [section]: resume[section] } : resume
  },
})

const listVisitedCountries = defineTool({
  name: "list_visited_countries",
  title: "Visited countries",
  description:
    "Countries and territories Rafa has visited, with the years of each visit. Brazil is home and counts for every year. Optionally filter to a single year.",
  inputSchema: {
    year: z.number().int().optional().describe("Only countries visited in this year."),
  },
  handler: ({ year }) => {
    const byCode = new Map<CountryCode, number[]>()
    for (const visit of getVisitedCountriesTimeline()) {
      if (year !== undefined && visit.year !== year) continue
      byCode.set(visit.code, [...(byCode.get(visit.code) ?? []), visit.year])
    }

    const countries = [...byCode.entries()]
      .map(([code, years]) => ({
        ...describeCountry(code),
        home: code === HOME_COUNTRY,
        firstVisit: Math.min(...years),
        years,
      }))
      .sort((a, b) => a.firstVisit - b.firstVisit || a.name.localeCompare(b.name))

    return { total: countries.length, year: year ?? null, countries }
  },
})

const listFlights = defineTool({
  name: "list_flights",
  title: "Flights",
  description:
    "Flights Rafa has taken, as drawn on the globe at rafaaudibert.dev/travel. Every international flight is listed; repetitive domestic hops are left out. Filter by year and/or airport IATA code.",
  inputSchema: {
    year: z.number().int().optional().describe("Only flights in this year."),
    airport: z
      .string()
      .length(3)
      .optional()
      .describe("Only flights departing from or arriving at this IATA code, e.g. POA."),
  },
  handler: ({ year, airport }) => {
    const code = airport?.toUpperCase()
    if (code && !(code in AIRPORTS)) {
      throw new ToolError(`Unknown airport "${code}". Known airports: ${Object.keys(AIRPORTS).join(", ")}`)
    }

    const flights = FLIGHTS.filter(
      (flight) =>
        (year === undefined || flight.year === year) &&
        (code === undefined || flight.from === code || flight.to === code)
    ).map((flight) => ({
      year: flight.year,
      from: describeAirport(flight.from),
      to: describeAirport(flight.to),
      // A layover means the destination country was only passed through.
      layover: flight.layover ?? false,
    }))

    return {
      total: flights.length,
      note: "Only international flights and a representative sample of domestic ones are recorded.",
      flights,
    }
  },
})

const getTravelSummary = defineTool({
  name: "get_travel_summary",
  title: "Travel summary",
  description:
    "Aggregate travel numbers: how many countries, flights and airports, a per-year breakdown, and the most used airports.",
  inputSchema: {},
  handler: () => {
    const countries = new Set(getVisitedCountriesTimeline().map((v) => v.code))
    const airports = new Set<AirportCode>()
    const airportUses = new Map<AirportCode, number>()
    const years = new Map<number, { flights: number; newCountries: CountryCode[] }>()
    const seenCountries = new Set<CountryCode>([HOME_COUNTRY])

    for (const flight of FLIGHTS) {
      for (const code of [flight.from, flight.to]) {
        airports.add(code)
        airportUses.set(code, (airportUses.get(code) ?? 0) + 1)
      }
      const entry = years.get(flight.year) ?? { flights: 0, newCountries: [] }
      entry.flights += 1
      years.set(flight.year, entry)
    }

    for (const visit of getVisitedCountriesTimeline()) {
      if (seenCountries.has(visit.code)) continue
      seenCountries.add(visit.code)
      const entry = years.get(visit.year) ?? { flights: 0, newCountries: [] }
      entry.newCountries.push(visit.code)
      years.set(visit.year, entry)
    }

    return {
      countriesVisited: countries.size,
      flightsRecorded: FLIGHTS.length,
      airportsUsed: airports.size,
      home: describeCountry(HOME_COUNTRY),
      byYear: [...years.entries()]
        .sort(([a], [b]) => a - b)
        .map(([year, entry]) => ({
          year,
          flights: entry.flights,
          newCountries: entry.newCountries.map(describeCountry),
        })),
      busiestAirports: [...airportUses.entries()]
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([code, flights]) => ({ ...describeAirport(code), flights })),
    }
  },
})

const summarisePost = ({ body: _body, ...post }: BlogIndexEntry) => post

const listBlogPosts = defineTool({
  name: "list_blog_posts",
  title: "Blog posts",
  description:
    "Rafa's blog posts, newest first, with title, description, publish date, tags and URL. Use get_blog_post for the full text. Optionally filter by tag.",
  inputSchema: {
    tag: z.string().optional().describe("Only posts carrying this tag (case-insensitive)."),
  },
  handler: async ({ tag }, ctx) => {
    const posts = await ctx.loadBlogIndex()
    const wanted = tag?.toLowerCase()
    const matching = posts.filter(
      (post) => !wanted || post.tags.some((t) => t.toLowerCase() === wanted)
    )
    return {
      total: matching.length,
      tags: [...new Set(posts.flatMap((post) => post.tags))].sort(),
      posts: matching.map(summarisePost),
    }
  },
})

const getBlogPost = defineTool({
  name: "get_blog_post",
  title: "Blog post",
  description: "The full Markdown source of one blog post, by slug (see list_blog_posts).",
  inputSchema: {
    slug: z.string().describe("Post slug, e.g. applying-for-a-job-in-2024."),
  },
  handler: async ({ slug }, ctx) => {
    const posts = await ctx.loadBlogIndex()
    const normalised = slug.replace(/^\/?blog\//, "").replace(/\/+$/, "")
    const post = posts.find((p) => p.slug === normalised)
    if (!post) {
      throw new ToolError(`No post with slug "${slug}". Known slugs: ${posts.map((p) => p.slug).join(", ")}`)
    }
    return post
  },
})

export const TOOLS: ToolDefinition[] = [
  getProfile,
  getResume,
  listVisitedCountries,
  listFlights,
  getTravelSummary,
  listBlogPosts,
  getBlogPost,
]

export const toolsFor = (privileged: boolean) =>
  TOOLS.filter((tool) => !tool.private || privileged)
