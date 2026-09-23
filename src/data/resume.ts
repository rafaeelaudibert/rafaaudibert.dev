// Plain data only: this module is imported by the Worker as well as the site,
// so anything that needs the Astro build (images, astro:* modules) lives elsewhere.
// Company logos are looked up by company name in ./companyLogos.ts.

export const FIRST_WORKING_YEAR = 2017

// Computed on call rather than at import: the Workers runtime pins the clock
// to epoch 0 while a module is being evaluated, so a module-level
// `new Date()` there reads as 1970.
export const yearsOfExperience = () => new Date().getFullYear() - FIRST_WORKING_YEAR

export const getBackgroundContent = () => [
  `Rafael has ${yearsOfExperience()}+ years of experience in various industries, ranging from seed-stage SaaS startups to growth-stage scaleups. Proven track record of working with <b>Ruby on Rails</b>, <b>Python + Django</b>, <b>Typescript + React</b>, and <b>Elixir + Phoenix</b>, building reliable and scalable software. He's motivated by creating new and engaging customer-centric apps loved by clients.`,
  "His passion is to build products that are both functional and aesthetically pleasing. More importantly, he wants the product to do exactly what the customer needs it to do. He has a strong background in both front-end and back-end development, and he is always looking for new challenges to tackle.",
]

export const PAST_EXPERIENCES = [
  {
    company: "PostHog",
    href: "https://posthog.com",
    role: "Product Engineer",
    startDate: "Nov 2024",
    endDate: "Present",
    bulletPoints: [
      "While working on the <strong>Web Analytics</strong> team ($5M+ ARR), implemented the <strong>Core Web Vitals + Performance</strong> tracking feature.",
      "Solo-built the <strong>Revenue Analytics</strong> product to help companies understand their revenue metrics and improve their products.",
      "After transferring Revenue Analytics to a new team — didn't find traction — I moved on to lead the <strong>Growth</strong> team, with focus on the company's growth and expansion.",
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
      "Implemented integrations with 4 big players in the Proptech industry, including 2-way sync PubSub-based infrastructure.",
      "Reduced frontend bundle size by 95% by applying modern frontend bundling practices while migrating from CRA to <strong>Vite</strong>.",
      "Grew company by 2 orders of magnitude while ensuring both the database and app architecture could sustain the higher load by migrating the company infrastructure from Heroku to AWS.",
    ],
  },
  {
    company: "TAG Livros",
    href: "https://taglivros.com.br/",
    role: "Software Engineer",
    startDate: "Nov 2019",
    endDate: "Mar 2021",
    bulletPoints: [
      "Developed a novel logistics IaC microservice architecture, integrating with tens of shipping companies, to handle 70k deliveries/month in a continental country such as Brazil, using <strong>Terraform</strong>.",
      "Maintained a legacy <strong>Django</strong> monolith responsible for the subscription process, while rewriting the old billing system on Serverless.",
      "Built an internal CLI to coordinate the company software deployment process, <strong>decreasing deployment time by 60%</strong>.",
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
      "<i>summa cum laude</i> Bachelor's degree in Computer Science from Universidade Federal do Rio Grande do Sul (UFRGS), Brazil",
  },
  {
    year: "2021",
    description:
      "Exchange student at the Technische Universität Kaiserslautern (TUK), Germany",
  },
  {
    year: "2019/2020",
    description:
      "2-time finalist in the Brazilian Competitive Programming Contest (ICPC)",
  },
]

// `cefr` is the Common European Framework band the working-proficiency label
// maps onto: Native ≈ C2, Professional Working ≈ C1, Limited Working ≈ B1,
// Elementary ≈ A2.
export const LANGUAGES = [
  { language: "Portuguese", level: "Native", cefr: "C2", flag: "🇧🇷" },
  { language: "English", level: "Professional Working Proficiency", cefr: "C1", flag: "🇺🇸" },
  { language: "Spanish", level: "Limited Working Proficiency", cefr: "B2", flag: "🇪🇸" },
  { language: "German", level: "Elementary Proficiency", cefr: "A2", flag: "🇩🇪" },
  { language: "French", level: "Elementary Proficiency", cefr: "A2", flag: "🇫🇷" },
  { language: "Italian", level: "Elementary Proficiency", cefr: "A2", flag: "🇮🇹" },
]

export const TECHNOLOGIES = [
  {
    type: "Programming Languages",
    technologies: [
      "Ruby",
      "Python",
      "Typescript",
      "Javascript",
      "Elixir",
      "Rust",
    ],
  },
  {
    type: "Frameworks",
    technologies: [
      "Ruby on Rails",
      "Django",
      "React",
      "Phoenix",
      "NextJS",
      "Gatsby",
      "Astro",
    ],
  },
  {
    type: "Databases",
    technologies: ["PostgreSQL", "Clickhouse", "Redis", "Elasticsearch"],
  },
  {
    type: "Cloud",
    technologies: [
      "AWS (Lambda, DynamoDB, S3, CloudFront, CloudWatch, RDS, ELB, Route 53)",
      "Supabase",
      "Vercel",
      "Netlify",
    ],
  },
  {
    type: "Tools",
    technologies: [
      "Docker",
      "Kubernetes",
      "Terraform",
      "Git",
      "GitHub",
      "GitLab",
      "CI/CD",
      "Semaphore CI",
      "Github Actions",
      "PostHog",
    ],
  },
  {
    type: "AI Tooling",
    technologies: ["Cursor", "Claude Code", "Lovable"],
  },
]
