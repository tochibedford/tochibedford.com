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

export const RESUME_PDF = "/tochukwu-bedford-resume.pdf";
export const EMAIL = "tochibedford.work@gmail.com";

export const entries: Entry[] = [
  {
    word: "offtop",
    title: "Offtop",
    meta: "Senior Full-Stack Engineer · 2024 to now",
    group: "Work",
    body: [
      "Offtop is where producers keep, organize and share their beats, samples and demos. We're a three-person company, so the two of us on engineering own the whole product: web, desktop, mobile, backend and infrastructure. I'm a top-two contributor across all three core codebases and the lead engineer on the mobile app.",
      "I built the real-time layer that pushes live upload progress and AI audio tagging to every client, over WebSockets, Server-Sent Events and MongoDB change streams that resume cleanly after a restart.",
      "I wrote the transcoding workers (ffmpeg, WAV to M4A and lossless FLAC) as their own service fed by SQS and BullMQ, and moved lossless files from S3 to Cloudflare R2 to stop paying egress.",
      "I also rolled out PostHog across web, backend, mobile and desktop on my own, with one shared event schema so the same action means the same thing on every platform. It gave the team its first unified view of funnels and retention.",
      "On mobile, the audio player starts in about a third of a second. It streams the first chunk over an HTTP range request and loads the rest in the background.",
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
      "A cross-platform Electron app that watches folders on a producer's machine and syncs new audio to the cloud. Files stream straight to S3 through a resumable queue, so a dropped connection doesn't mean starting over.",
      "I also set up its release pipeline: notarized macOS builds, Windows builds signed through Azure Key Vault, and auto-updates served from S3.",
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
      "Producers can manage their Offtop library by texting it. The assistant runs on OpenAI tool calling with nine tools, and sends are spread across a pool of phone numbers with daily caps so none of them get flagged as spam.",
    ],
    stack: ["OpenAI tool calling", "Node", "NestJS"],
    links: [{ label: "Text Offtop", href: "https://offtop.com/text" }],
  },
  {
    word: "axxess",
    title: "Axxess",
    meta: "Front End Engineer · 2023 to 2024",
    group: "Work",
    body: [
      "My first proper full-time role. I worked on the front end of Axxess's hospice product, healthcare software used by thousands of clinicians.",
      "A lot of those clinicians were on older devices, so everything I built had to work in browsers as far back as Chrome 55 and Safari 7.",
    ],
    stack: ["Aurelia", "RxJS", "TypeScript", "SCSS"],
    links: [{ label: "axxess.com", href: "https://www.axxess.com" }],
  },
  {
    word: "foundry",
    title: "Foundry",
    meta: "iOS app · 2026",
    group: "Things I've made",
    body: [
      "Foundry: Pocket Sampler is a sampler for your phone. Chop audio into pads, find loops, sequence them. I built it in React Native and Expo with custom native modules.",
      "Under the hood is a C++ BPM engine I validated against librosa, scored on 165 ground-truth tracks, and on-device separation into four stems using Meta's htdemucs model through Core ML with Swift DSP code.",
    ],
    stack: ["React Native", "Expo Modules", "C++", "Swift", "Core ML", "Skia", "RevenueCat"],
    links: [{ label: "App Store", href: "https://apps.apple.com/us/app/foundry-pocket-sampler/id6811312792" }],
  },
  {
    word: "querci",
    title: "Querci",
    meta: "My company",
    group: "Things I've made",
    body: [
      "Querci started as a web app for sharing music stems, with resumable, verified uploads, waveform peaks computed in a Web Worker and files handled through OPFS. It has since grown into my healthcare automation business.",
    ],
    stack: ["React", "TypeScript", "Vite", "Web Workers", "OPFS", "Cloud Run"],
    links: [{ label: "querci.net", href: "https://querci.net" }],
  },
  {
    word: "healthcare",
    title: "Healthcare automation",
    meta: "Querci · ongoing",
    group: "Things I've made",
    body: [
      "Through Querci, I automate clinical documentation for healthcare providers: visit notes, billing codes and certifications, drafted for the provider to review and approve.",
      "I also build tools for them, like a browser-only app that splits a practice's master form packet and pre-fills patient details without any data leaving the device.",
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
      "A focus-session app on the App Store, built with Expo, with RevenueCat subscriptions, PostHog analytics, Airbridge attribution and over-the-air updates.",
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
      "Site and shop for a medical group: Next.js App Router, a Shopify Storefront cart, Cal.com booking and structured data for search.",
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
    group: "Open source",
    body: ["Added the mount callback the library was missing. Merged as PR #68 and shipped in 1.6.0."],
    stack: ["React", "TypeScript"],
    links: [{ label: "Library", href: "https://react-fast-marquee.com" }],
  },
  {
    word: "reduse",
    title: "Reduse",
    meta: "CLI · npm",
    group: "Open source",
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
    word: "cpp",
    title: "C++",
    meta: "Learning · since late 2025",
    group: "Learning",
    body: [
      "I picked up C++ in late 2025. So much of my work is audio, and most serious audio code is written in C++, so I wanted to be able to read and write it myself.",
      "I learned it on and off, then started using it for real. Foundry's BPM engine is C++ running inside React Native, and I've started applying it to tools we use at Offtop. Along the way I wrote a WAV file writer and an HTTP server from scratch.",
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
    body: ["The first classification model I trained. It listens to a drum hit and tells you whether it's a kick, a snare, a clap or a hi-hat."],
    stack: ["Python"],
    links: [{ label: "Code", href: "https://github.com/tochibedford/SoundRec" }],
  },
  {
    word: "curses",
    title: "Custom Curses",
    meta: "2023 · library",
    group: "Where I started",
    body: ["Physics-driven custom cursors for any web page."],
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
    body: ["A ray tracer I wrote from scratch in TypeScript, rendering to canvas."],
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
