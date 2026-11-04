// Plain data only: this module is imported by the Worker as well as the site,
// so anything that needs the Astro build (images, astro:* modules) lives elsewhere.
// Links in the HTML strings stay bare `<a href='…'>`: the resume page adds the
// new-tab handling and the Worker turns them into Markdown links.
// Company logos are looked up by company name in ./companyLogos.ts.

export const FIRST_WORKING_YEAR = 2017

// Computed on call rather than at import: the Workers runtime pins the clock
// to epoch 0 while a module is being evaluated, so a module-level
// `new Date()` there reads as 1970.
export const yearsOfExperience = () => new Date().getFullYear() - FIRST_WORKING_YEAR

export const getBackgroundContent = () => [
  `Product engineer with ${yearsOfExperience()}+ years across seed-stage startups and a scale-up. I lead the <a href='https://posthog.com/teams/growth'><b>Growth</b></a> team at PostHog, working on how people and their AI agents find, set up and adopt PostHog. Previously worked on onboarding, activation and cross-sell for humans, while also shipping <a href='https://posthog.com/docs/web-analytics/web-vitals'><b>Core Web Vitals</b></a> monitoring and <a href='https://posthog.com/docs/revenue-analytics'>Revenue tracking</a>.`,
  "I build end to end: data models and APIs in <b>Rails</b>, <b>Django</b> and <b>Phoenix</b>, interfaces in <b>TypeScript + React</b>, and the infrastructure underneath on AWS and Cloudflare.",
]

// `print: false` keeps an entry on the web page but off the printed resume,
// which has to fit two pages.
export const PAST_EXPERIENCES = [
  {
    company: "PostHog",
    href: "https://posthog.com",
    role: "Product Engineer",
    startDate: "Nov 2024",
    endDate: "Present",
    bulletPoints: [
      "Lead the <a href='https://posthog.com/teams/growth'><strong>Growth</strong></a> team, owning onboarding, activation and cross-sell: how a signup gets set up, reaches value and finds the rest of PostHog's products. PostHog grew from <strong>$30M to $100M ARR</strong> in that time (as of Nov 2026).",
      "Made PostHog usable by AI agents: interactive <strong>MCP Apps</strong>, enterprise-managed authorization for the MCP server, and OAuth support that lets <strong>CIMD</strong> and <strong>DCR</strong> apps connect to PostHog. Built APIs that let partners provision new PostHog accounts headlessly.",
      "Built <strong>hog</strong>, PostHog's agent-optimized CLI, covering login, queries, the full API, CI, installation and AI skills.",
      "While working on the <strong>Web Analytics</strong> team ($5M+ ARR), implemented the <a href='https://posthog.com/docs/web-analytics/web-vitals'><strong>Core Web Vitals + Performance</strong></a> tracking feature. Also spun up a new solo <a href='https://posthog.com/docs/revenue-analytics'><strong>Revenue Analytics</strong></a> team for 6 months, tracking revenue and connecting it to analytics.",
    ],
  },
  {
    company: "LeadSimple",
    href: "https://leadsimple.com",
    role: "Senior Software Engineer",
    startDate: "Mar 2021",
    endDate: "Nov 2024",
    bulletPoints: [
      "Built the company's flagship product in <strong>Ruby on Rails</strong> + <strong>React/TS</strong>, with a fully-fledged <strong>GraphQL API</strong>, deploying tens of times every day.",
      "Integrated with 4 big Proptech players, including 2-way sync PubSub-based infrastructure.",
      "Reduced frontend bundle size by 95% with modern bundling practices while migrating from CRA to <strong>Vite</strong>.",
    ],
  },
  {
    company: "TAG Livros",
    href: "https://taglivros.com.br/",
    role: "Software Engineer",
    startDate: "Nov 2019",
    endDate: "Mar 2021",
    bulletPoints: [
      "Developed a novel logistics IaC microservice architecture, integrating with tens of shipping companies, to handle 70k deliveries/month in a continental country such as Brazil, using <strong>Terraform</strong> and <strong>AWS Lambda</strong>.",
      "Maintained a legacy <strong>Django</strong> monolith handling subscriptions, while rewriting the billing system on Serverless.",
      "Built an internal CLI to coordinate company deployments, <strong>decreasing deployment time by 60%</strong>.",
    ],
  },
  {
    company: "FEENG/UFRGS",
    href: "https://www.feeng.com.br/",
    role: "Software Engineer",
    startDate: "Mar 2017",
    endDate: "Nov 2019",
    bulletPoints: [
      "Led the initial MVP for the Brazilian government in a 3-month timeframe with a team of 3 junior engineers, and got the project greenlit by it.",
      "Built a <strong>fully-dockerized Ruby on Rails MVC</strong> application for the Brazilian public health system UBSs (small health clinics spread through Brazilian neighborhoods).",
      "Provisioned infrastructure in AWS, using <strong>EC2, RDS, ELB, Route 53, and CloudWatch</strong>.",
    ],
  },
]

export const EDUCATION_AND_ACHIEVEMENTS = [
  {
    year: "2022",
    description:
      "<b><i>summa cum laude</i></b> Bachelor's degree in <b>Computer Science</b> from <a href='https://www.ufrgs.br/'>Universidade Federal do Rio Grande do Sul (UFRGS)</a>, Brazil",
  },
  {
    year: "2021",
    description:
      "<b>Exchange student</b> at the <a href='https://rptu.de/'>Rheinland-Pfälzische Technische Universität Kaiserslautern-Landau (RPTU)</a>, Germany",
  },
  {
    year: "2019/2020",
    description:
      "<b>2-time finalist</b> in the Brazilian Competitive Programming Contest (<a href='https://maratona.sbc.org.br/'>ICPC</a>)",
  },
]

// `cefr` is the Common European Framework band the working-proficiency label
// maps onto: Native ≈ C2, Professional Working ≈ C1, Limited Working ≈ B2,
// Elementary ≈ A1.
export const LANGUAGES = [
  { language: "Portuguese", level: "Native", cefr: "C2", flag: "🇧🇷" },
  { language: "English", level: "Professional Working Proficiency", cefr: "C1", flag: "🇺🇸" },
  { language: "Spanish", level: "Limited Working Proficiency", cefr: "B2", flag: "🇪🇸" },
  { language: "German", level: "Elementary Proficiency", cefr: "A1", flag: "🇩🇪" },
  { language: "French", level: "Elementary Proficiency", cefr: "A1", flag: "🇫🇷" },
  { language: "Italian", level: "Elementary Proficiency", cefr: "A1", flag: "🇮🇹" },
]

export const TECHNOLOGIES = [
  {
    type: "Programming Languages",
    technologies: [
      "Elixir",
      "Javascript",
      "Python",
      "Ruby",
      "Rust",
      "Typescript",
    ],
  },
  {
    type: "Frameworks",
    technologies: [
      "Ruby on Rails",
      "Django",
      "React",
      "TanStack",
      "Tailwind",
      "Phoenix",
      "NextJS",
      "Gatsby",
      "Astro",
    ],
  },
  {
    type: "Databases",
    technologies: ["Clickhouse", "Elasticsearch", "PostgreSQL", "Redis"],
  },
  {
    type: "Cloud",
    technologies: [
      "AWS Lambda",
      "AWS DynamoDB",
      "AWS S3",
      "AWS CloudFront",
      "AWS Route 53",
      "Cloudflare Workers",
      "Cloudflare R2",
      "Cloudflare D1",
      "Convex",
      "Netlify",
      "Supabase",
      "Vercel",
    ],
  },
  {
    type: "Tools",
    technologies: [
      "CI/CD",
      "Depot",
      "Docker",
      "Gauge",
      "Git",
      "GitHub",
      "Github Actions",
      "GitLab",
      "Graphite",
      "Greptile",
      "PostHog",
      "Semaphore CI",
      "Terraform",
      "Trunk",
    ],
  },
  {
    type: "AI Tooling",
    technologies: ["Claude Code", "Codex", "Cursor", "Lovable"],
  },
]
