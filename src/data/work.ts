/**
 * Everything the site says about Tochi. Each entry is unlocked by typing its `word`.
 * Sources: master CV and project bank in ~/jobs/master. Keep claims there in sync.
 */

export type Entry = {
  word: string; // what you type to open it (lowercase, letters/digits only)
  title: string;
  meta: string; // role · year
  group: "Offtop" | "Shipped" | "Client work" | "Open source & experiments" | "Me";
  body: string[];
  note?: string; // smaller, quieter line under the body
  stack?: string[];
  links?: { label: string; href: string }[];
};

export const RESUME_PDF = "/tochukwu-bedford-resume.pdf";
export const EMAIL = "tochibedford.work@gmail.com";

export const entries: Entry[] = [
  {
    word: "offtop",
    title: "Offtop",
    meta: "Senior Full-Stack Engineer · 2024 to now",
    group: "Offtop",
    body: [
      "Offtop is where producers keep, organize and share their beats, samples and demos. We're a three-person company, so the two of us on engineering own the whole product: web, desktop, mobile, backend and infrastructure. I'm a top-two contributor across all three core codebases and the lead engineer on the mobile app.",
      "I built the real-time layer that pushes live upload progress and AI audio tagging to every client, over WebSockets, Server-Sent Events and MongoDB change streams that resume cleanly after a restart.",
      "I wrote the transcoding workers (ffmpeg, WAV to M4A and lossless FLAC) as their own service fed by SQS and BullMQ, and moved lossless files from S3 to Cloudflare R2 to stop paying egress.",
      "On mobile, the audio player starts in about a third of a second. It streams the first chunk over an HTTP range request and loads the rest in the background.",
    ],
    stack: ["TypeScript", "NestJS", "Angular", "React Native", "Expo", "MongoDB", "Redis", "AWS", "Cloudflare R2", "PostHog"],
    links: [{ label: "offtop.com", href: "https://offtop.com" }],
  },
  {
    word: "link",
    title: "Offtop Link",
    meta: "Desktop app · designed and built solo",
    group: "Offtop",
    body: [
      "A cross-platform Electron app that watches folders on a producer's machine and syncs new audio to the cloud. Files stream straight to S3 through a resumable queue, so a dropped connection doesn't mean starting over.",
      "I also set up its release pipeline: notarized macOS builds, Windows builds signed through Azure Key Vault, and auto-updates served from S3.",
    ],
    stack: ["Electron", "electron-vite", "React", "TanStack Router", "better-sqlite3", "chokidar", "S3"],
  },
  {
    word: "imessage",
    title: "iMessage assistant",
    meta: "Offtop · AI",
    group: "Offtop",
    body: [
      "Producers can manage their Offtop library by texting it. The assistant runs on OpenAI tool calling with nine tools, and sends are spread across a pool of phone numbers with daily caps so none of them get flagged as spam.",
    ],
    stack: ["OpenAI tool calling", "Node", "NestJS"],
  },
  {
    word: "posthog",
    title: "Analytics across the stack",
    meta: "Offtop · Product data",
    group: "Offtop",
    body: [
      "I rolled out PostHog across web, backend, mobile and desktop on my own, with one shared event schema so the same action means the same thing on every platform. It gave the team its first unified view of funnels and retention, plus session replay and feature flags.",
    ],
    stack: ["PostHog", "Event design"],
  },
  {
    word: "foundry",
    title: "Foundry",
    meta: "iOS app · 2026",
    group: "Shipped",
    body: [
      "Foundry: Pocket Sampler is a sampler for your phone. Chop audio into pads, find loops, sequence them. I built it in React Native and Expo with custom native modules.",
      "Under the hood is a C++ BPM engine I validated against librosa, scored on 165 ground-truth tracks, and on-device separation into four stems using Meta's htdemucs model through Core ML with Swift DSP code.",
    ],
    stack: ["React Native", "Expo Modules", "C++", "Swift", "Core ML", "Skia", "RevenueCat"],
    links: [{ label: "App Store", href: "https://apps.apple.com/us/app/foundry-pocket-sampler/id6811312792" }],
  },
  {
    word: "still",
    title: "Still",
    meta: "iOS app · shipped",
    group: "Shipped",
    body: [
      "A focus-session app on the App Store, built with Expo, with RevenueCat subscriptions, PostHog analytics, Airbridge attribution and over-the-air updates.",
    ],
    stack: ["Expo", "RevenueCat", "PostHog", "EAS Update"],
  },
  {
    word: "querci",
    title: "Querci",
    meta: "My company",
    group: "Shipped",
    body: [
      "Querci started as a web app for sharing music stems, with resumable, verified uploads, waveform peaks computed in a Web Worker and files handled through OPFS. It has since grown into a healthcare automation business.",
      "Drawing on my time building EHR software at Axxess, I automate clinical documentation for a medical practice, and build browser-only tools for providers that keep patient data on the device.",
    ],
    stack: ["React", "TypeScript", "Vite", "Web Workers", "OPFS", "pdf-lib", "Cloud Run"],
    links: [{ label: "querci.net", href: "https://querci.net" }],
  },
  {
    word: "pathwise",
    title: "PathWise",
    meta: "Mobile app",
    group: "Shipped",
    body: [
      "A trip-planning app with place search, route estimation and route optimization. Expo on the front, NestJS with Drizzle and PostgreSQL behind it.",
    ],
    stack: ["Expo", "NestJS", "Drizzle", "PostgreSQL", "Better Auth", "Google Places"],
  },
  {
    word: "threds",
    title: "threds",
    meta: "Chrome extension",
    group: "Shipped",
    body: [
      "A Chrome extension for trying clothes on virtually while you shop, with a NestJS backend and presigned S3 uploads.",
    ],
    stack: ["Chrome MV3", "React", "Vite", "NestJS", "PostgreSQL", "S3"],
  },
  {
    word: "amber",
    title: "Amber Medical Group",
    meta: "Client site",
    group: "Client work",
    body: [
      "Site and shop for a medical group: Next.js App Router, a Shopify Storefront cart, Cal.com booking and structured data for search.",
    ],
    stack: ["Next.js", "React 19", "Tailwind v4", "Shopify Storefront API", "Cal.com"],
    links: [{ label: "ambermedicalgroup.com", href: "https://ambermedicalgroup.com" }],
  },
  {
    word: "shorefund",
    title: "ShoreFund",
    meta: "Client site",
    group: "Client work",
    body: [
      "Lead generation for a UK small-business finance broker. A multi-step form posts to a validated API route with a honeypot and rate limiting, stores to Supabase and notifies by email.",
    ],
    stack: ["Next.js", "Supabase", "Resend"],
  },
  {
    word: "44db",
    title: "44DB",
    meta: "Client site",
    group: "Client work",
    body: [
      "Site for 44DB, a Nigerian producer collective, with the catalogue in Sanity so they can update it themselves.",
    ],
    stack: ["React", "TypeScript", "Sanity", "Vite"],
    links: [
      { label: "44db.net", href: "https://www.44db.net" },
      { label: "Code", href: "https://github.com/tochibedford/44Site" },
    ],
  },
  {
    word: "marquee",
    title: "React Fast Marquee",
    meta: "Open source",
    group: "Open source & experiments",
    body: ["Added the mount callback the library was missing. Merged as PR #68 and shipped in 1.6.0."],
    stack: ["React", "TypeScript"],
    links: [{ label: "Library", href: "https://react-fast-marquee.com" }],
  },
  {
    word: "reduse",
    title: "Reduse",
    meta: "CLI · npm",
    group: "Open source & experiments",
    body: [
      "Converts every image in a web repo to the format you choose, then rewrites every import that pointed at the old files. Respects .gitignore.",
    ],
    stack: ["TypeScript", "Sharp", "glob"],
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/reduse" },
      { label: "Code", href: "https://github.com/tochibedford/reduse" },
    ],
  },
  {
    word: "curses",
    title: "Custom Curses",
    meta: "Library",
    group: "Open source & experiments",
    body: ["Physics-driven custom cursors for any web page."],
    stack: ["TypeScript", "Canvas"],
    links: [
      { label: "Demo", href: "https://tochibedford.github.io/custom-curses/" },
      { label: "Code", href: "https://github.com/tochibedford/custom-curses" },
    ],
  },
  {
    word: "about",
    title: "About",
    meta: "Tochukwu Bedford · Los Angeles",
    group: "Me",
    body: [
      "I'm Tochi, a senior software engineer in Los Angeles. I wrote my first line of code in December 2017 and haven't stopped since.",
      "I started out in machine learning, and trained my first classification model in 2019. From there I moved into full-stack web development, taking on freelance projects along the way. At Axxess I built healthcare software used by thousands of clinicians.",
      "These days I'm at Offtop, working on every part of the product: web, mobile, desktop, the backend and the infrastructure it all runs on.",
      "Outside of work I make beats, and that's where this site comes from. Every sound on this page came out of my own FL Studio session, in F minor.",
      "I graduated from Covenant University in 2022 with a First Class Honours degree in Mechanical Engineering.",
    ],
    stack: ["TypeScript", "React Native", "NestJS", "Angular", "React", "Node", "Python", "C++", "Swift", "AWS", "Cloudflare"],
  },
  {
    word: "resume",
    title: "Résumé",
    meta: "PDF · 2 pages",
    group: "Me",
    body: ["The whole thing on two pages: Offtop, Axxess, Devos and Social Crucifixion, plus skills and education."],
    links: [{ label: "Open résumé (PDF)", href: RESUME_PDF }],
  },
  {
    word: "hello",
    title: "Say hello",
    meta: "Contact",
    group: "Me",
    body: ["Hiring an engineer who cares about performance, like how fast an app loads, responds and feels? Email is the fastest way to reach me."],
    note: "And if you're building something with audio, or just want to compare plugin chains, I'm always up for that too.",
    links: [
      { label: "GitHub", href: "https://github.com/tochibedford" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/tochukwu-bedford/" },
      { label: "X", href: "https://x.com/TochiBedford" },
    ],
  },
];
