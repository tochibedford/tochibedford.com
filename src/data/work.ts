/**
 * Everything the site says about Tochi. Each entry is unlocked by typing its `word`.
 * Sources: master CV and project bank in ~/jobs/master. Keep claims there in sync.
 */

export const GROUPS = ["Work", "Things I've made", "For clients", "Open source", "Learning", "Where I started", "Me"] as const;
export type Group = (typeof GROUPS)[number];

export type Entry = {
  word: string; // what you type to open it (lowercase, letters/digits only)
  title: string;
  meta: string; // role · year
  group: Group;
  body: string[]; // may contain inline links (trusted, written here)
  note?: string; // smaller, quieter line under the body
  stack?: string[];
  links?: { label: string; href: string }[];
};

/** Where the site lives. Canonical URLs, the sitemap, link previews and llms.txt all build on it. */
export const SITE = "https://dev.tochibedford.com";
export const RESUME_PDF = "/tochukwu-bedford-resume.pdf";
export const HOME_TITLE = "Tochi Bedford · Senior Software Engineer in Los Angeles";
export const pageTitle = (e: Entry) => `${e.title} · Tochi Bedford`;
export const EMAIL = "tochibedford.work@gmail.com";

export const entries: Entry[] = [
  {
    word: "axxess",
    title: "Axxess",
    meta: "Software Engineer · 2023 to 2024",
    group: "Work",
    body: [
      "Axxess hired me right before I finished university. I got the offer in the last few months of my final year and joined in January 2023.",
      "I was a software engineer on their hospice product, used by thousands of clinicians, in a team spread across India, Nigeria and the United States. A lot of those clinicians were on older devices, so our work had to run in browsers as old as Chrome 55 and Safari 7.",
    ],
    stack: ["Aurelia", "RxJS", "TypeScript", "SCSS"],
    links: [{ label: "axxess.com", href: "https://www.axxess.com" }],
  },
  {
    word: "offtop",
    title: "Offtop",
    meta: "Senior Full-Stack Engineer · 2024 to now",
    group: "Work",
    body: [
      'In December 2023 I <a href="https://x.com/TochiBedford/status/1737774670659637758" rel="noopener" target="_blank">posted a video</a> of an early desktop app John Uwaishe and I had built for transferring files, with uploads that could pick up where they left off. Sam Hamad saw it, and in 2024 I joined him to work on Offtop.',
      "I've worked on every part of Offtop since: the web app, the mobile app, the backend and the infrastructure. I lead the mobile app, and I designed and built Offtop Link, our desktop app, on my own.",
      "A lot of what producers use on Offtop today came through me, including the mobile app, Offtop Link, the iMessage agent, the analytics the team uses to make product decisions, and much of the backend infrastructure the whole platform runs on.",
    ],
    stack: ["TypeScript", "NestJS", "Angular", "React Native", "Expo", "MongoDB", "Redis", "AWS", "Cloudflare R2", "PostHog"],
    links: [{ label: "offtop.com", href: "https://offtop.com" }],
  },
  {
    word: "link",
    title: "Offtop Link",
    meta: "Desktop app · designed and built solo",
    group: "Work",
    body: [
      "Offtop Link is Offtop's desktop sync app for Mac and Windows. I designed and built it on my own.",
      "It watches the folders where producers save their music and backs everything up to Offtop as they work.",
    ],
    stack: ["Electron", "electron-vite", "React", "TanStack Router", "better-sqlite3", "chokidar", "S3"],
    links: [{ label: "Download Offtop Link", href: "https://offtop.com/download" }],
  },
  {
    word: "imsg",
    title: "IMSG Offtop Agent",
    meta: "Offtop · AI",
    group: "Work",
    body: [
      "An AI agent I built that lets producers manage their Offtop library over iMessage, just by texting it.",
      "When a message comes in, the agent identifies the sender and authenticates them against their Offtop account. It handles model routing, sending each request to the model best suited to it, and uses tool calling to work with the user's library.",
      "It also handles replying from a pool of phone numbers with daily limits, so no single number gets flagged as spam.",
    ],
    stack: ["OpenAI tool calling", "Node", "NestJS"],
    links: [{ label: "Text Offtop", href: "https://offtop.com/text" }],
  },
  {
    word: "foundry",
    title: "Foundry",
    meta: "iOS app · 2026",
    group: "Things I've made",
    body: [
      "Foundry: Pocket Sampler is a sampling app for iPhone that I built and published. Everything runs on the device, with no backend API.",
      "It covers chopping audio into pads, loop finding, sequencing and stem splitting, which runs on the phone using Meta's htdemucs model. I implemented MIDI input over Bluetooth, USB and the network (RTP-MIDI), so it works with external controllers.",
      "Key and tempo detection are implemented from the published research: key from Gómez's HPCP method (2006) and tempo from Zapata, Davies and Gómez's multi-feature beat tracker (2014). Alongside that I wrote my own tempo estimator in C++ that votes with the beat tracker on the final BPM, tested against 165 tracks with known tempos.",
    ],
    stack: ["React Native", "Expo Modules", "C++", "Swift", "Core ML", "Skia", "RevenueCat"],
    links: [{ label: "App Store", href: "https://apps.apple.com/us/app/foundry-pocket-sampler/id6811312792" }],
  },
  {
    word: "querci",
    title: "Querci",
    meta: "My company · ongoing",
    group: "Things I've made",
    body: [
      "I started Querci as a web app for sharing music stems. It's now my healthcare automation company.",
      "Through Querci I automate clinical documentation for healthcare providers. I learn how each practice works, then automate the documentation that takes up their time, inside the systems they already use, with the provider reviewing and signing off on everything.",
      "I also build tools for them, like a browser app that splits a practice's form packet and fills in patient details without the data leaving the computer.",
    ],
    note: "Client names and details stay private, since this work touches patient data.",
    stack: ["Browser automation", "React", "TypeScript", "pdf-lib", "Web Workers"],
    links: [{ label: "querci.net", href: "https://querci.net" }],
  },
  {
    word: "still",
    title: "Still",
    meta: "iOS app · shipped",
    group: "Things I've made",
    body: [
      "Still is a focus app on the App Store, and the first mobile app I built and shipped. It has subscriptions, analytics and over-the-air updates.",
    ],
    stack: ["Expo", "RevenueCat", "PostHog", "EAS Update"],
    links: [{ label: "App Store", href: "https://apps.apple.com/us/app/still-30-minutes-no-excuses/id6758331520" }],
  },
  {
    word: "amber",
    title: "Amber Medical Group",
    meta: "Client site",
    group: "For clients",
    body: [
      "I built the website and online shop for Amber Medical Group, including the cart, appointment booking and the setup for search engines.",
    ],
    stack: ["Next.js", "React 19", "Tailwind v4", "Shopify Storefront API", "Cal.com"],
    links: [{ label: "ambermedicalgroup.com", href: "https://ambermedicalgroup.com" }],
  },
  {
    word: "44db",
    title: "44DB",
    meta: "Client site",
    group: "For clients",
    body: [
      "I built the website for 44DB, a Nigerian producer collective. Their catalogue lives in Sanity so they can update it without me.",
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
    group: "Open source",
    body: [
      "I added a mount callback to React Fast Marquee. It was merged as PR #68 and shipped in version 1.6.0.",
    ],
    stack: ["React", "TypeScript"],
    links: [{ label: "Library", href: "https://react-fast-marquee.com" }],
  },
  {
    word: "reduse",
    title: "Reduse",
    meta: "CLI · npm",
    group: "Open source",
    body: [
      "Reduse is a command-line tool I wrote and published on npm. It converts every image in a web project to the format you pick, then updates every import that pointed at the old files.",
    ],
    stack: ["TypeScript", "Sharp", "glob"],
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/reduse" },
      { label: "Code", href: "https://github.com/tochibedford/reduse" },
    ],
  },
  {
    word: "cpp",
    title: "C++",
    meta: "Learning · since late 2025",
    group: "Learning",
    body: [
      "I started learning C++ in late 2025 because most serious audio code is written in it.",
      "I've since used it for Foundry's BPM detector, and I'm starting to use it on tools at Offtop. Along the way I wrote a WAV file writer and an HTTP server from scratch.",
    ],
    links: [
      { label: "wavwrite", href: "https://github.com/tochibedford/wavwrite" },
      { label: "cppserver", href: "https://github.com/tochibedford/cppserver" },
    ],
  },
  {
    word: "soundrec",
    title: "SoundRec",
    meta: "2019 · my first model",
    group: "Where I started",
    body: [
      "The first classification model I trained, in 2019. It listens to a drum hit and tells you whether it's a kick, a snare, a clap or a hi-hat.",
    ],
    stack: ["Python"],
    links: [{ label: "Code", href: "https://github.com/tochibedford/SoundRec" }],
  },
  {
    word: "curses",
    title: "Custom Curses",
    meta: "2023 · library",
    group: "Where I started",
    body: [
      "Custom Curses is a small library I wrote in 2023 for physics-based custom cursors on web pages.",
    ],
    stack: ["TypeScript", "Canvas"],
    links: [
      { label: "Demo", href: "https://tochibedford.github.io/custom-curses/" },
      { label: "Code", href: "https://github.com/tochibedford/custom-curses" },
    ],
  },
  {
    word: "tracer",
    title: "X-Tracer",
    meta: "2023 · ray tracer",
    group: "Where I started",
    body: [
      "X-Tracer is a ray tracer I wrote from scratch in TypeScript in 2023, drawing to a canvas.",
    ],
    stack: ["TypeScript", "Canvas"],
    links: [
      { label: "Demo", href: "https://tochibedford.github.io/x-tracer/" },
      { label: "Code", href: "https://github.com/tochibedford/x-tracer" },
    ],
  },
  {
    word: "about",
    title: "About",
    meta: "Tochukwu Bedford · Los Angeles",
    group: "Me",
    body: [
      "I'm Tochi, a senior software engineer in Los Angeles. I wrote my first line of code in December 2017. I started out with Python and machine learning, and trained my first classification model in 2019.",
      'From there I moved into full-stack web development, taking on freelance projects along the way. At <a href="https://www.axxess.com" rel="noopener" target="_blank">Axxess</a> I built healthcare software used by thousands of clinicians.',
      "These days I'm at Offtop, working on every part of the product: web, mobile, desktop, the backend and the infrastructure it all runs on.",
      "Outside of work I make beats, and that's where this site comes from. Every sound on this page came out of my own FL Studio session, in F minor.",
      "I graduated from Covenant University in 2022 with a First Class Honours degree in Mechanical Engineering.",
    ],
  },
  {
    word: "generalist",
    title: "On being a generalist",
    meta: "Essay · 2026",
    group: "Me",
    body: [
      "Isaac Newton never called himself a physicist. He studied natural philosophy, which meant all of how the world works, and out of that one pursuit came the laws of motion and gravity, his work on light and colour, a share of calculus, and decades of experiments in alchemy, the chemistry of his time. Somewhere since then we started splitting knowledge into job titles and asking people to pick one and stay in it for life.",
      "I studied mechanical engineering in university, I write software for a living, I make beats, and lately I read signal-processing papers so I can implement them in C++. None of that feels like changing careers to me. It's the same curiosity pointed at different problems, and each field keeps handing me tools for the next: the music ended up in the apps I build, and the healthcare work came from learning how a clinic actually runs. I think we should bring this back, people contributing to several fields over a lifetime instead of being defined by one. Being good at several things doesn't mean being shallow at all of them; it means having a home base and the freedom to leave it. A specialty is a good place to stand, but it shouldn't be the only place you're allowed to go.",
    ],
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

/** Words with their own page at "/<word>". "/resume" is left to its own page, which opens the PDF. */
export const PAGE_WORDS = new Set(entries.map((e) => e.word).filter((w) => w !== "resume"));
