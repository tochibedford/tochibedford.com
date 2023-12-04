/**
 * 📂 Who has time for a database or CMS anyway?
 */

import githubIcon from "./components/assets/github.svg";
import twitterIcon from "./components/assets/twitter.svg";
import instagramIcon from "./components/assets/instagram.svg";
import type { ImageMetadata } from "astro";

export const navMenuItems: {
  idName: string;
  displayName: string;
  link: string;
  isExternal: boolean;
  released: boolean;
}[] = [
  {
    idName: "home",
    displayName: "Home",
    link: "/",
    isExternal: false,
    released: true,
  },
  {
    idName: "tools",
    displayName: "Tools",
    link: "/tools",
    isExternal: false,
    released: true,
  },
  {
    idName: "articles",
    displayName: "Articles",
    link: "/articles",
    isExternal: false,
    released: false,
  },
  {
    idName: "resume",
    displayName: "Resume",
    link: "/resume",
    isExternal: false,
    released: true,
  },
  {
    idName: "experiments",
    displayName: "Experiments",
    link: "/experiments",
    isExternal: false,
    released: true,
  },
];

export const socialItems: {
  idName: string;
  displayName: string;
  link: string;
  image: ImageMetadata;
}[] = [
  {
    idName: "github",
    displayName: "Github",
    link: "https://github.com/tochibedford",
    image: githubIcon,
  },
  {
    idName: "twitter",
    displayName: "Twitter",
    link: "https://twitter.com/tochibedford",
    image: twitterIcon,
  },
  {
    idName: "instagram",
    displayName: "Instagram",
    link: "https://instagram.com/tochibedford",
    image: instagramIcon,
  },
];

export enum WorkState {
  Live = "Live",
  Code = "Code",
  NPM = "npm",
  Windows = "Windows",
  MacOs = "MacOs",
}

export enum Tool {
  C = "C",
  Rust = "Rust",
  Sharp = "Sharp",
  Glob = "glob",
  Astro = "Astro",
  Axios = "Axios",
  Clerk = "Clerk JS",
  FramerMotion = "Framer Motion",
  JSZip = "JSZip",
  Sonner = "Sonner",
  Tailwind = "TailwindCss",
  Typescript = "Typescript",
  Electron = "Electron JS",
  NodeJs = "Node JS",
  Javascript = "Javascript",
  SCSS = "SCSS/SASS",
  Python = "Python",
  MYSQL = "MySQL",
  CSharp = "C#",
  Jest = "Jest",
  React = "React",
  Bootstrap = "Bootstrap",
  Flask = "Flask",
  Express = "Express",
  Webpack = "Webpack",
  Babel = "Babel",
  Parcel = "Parcel",
  MongoDB = "MongoDB",
  FireStore = "Firebase FireStore",
  SanityCMS = "Sanity CMS",
  Vite = "Vite",
}

export const toolLinks: { [key in Tool]: string | undefined } = {
  [Tool.Astro]: "https://astro.build/",
  [Tool.C]: undefined,
  [Tool.Rust]: "https://www.rust-lang.org/",
  [Tool.Sharp]: "https://sharp.pixelplumbing.com/",
  [Tool.Glob]: "https://github.com/isaacs/node-glob",
  [Tool.Axios]: "https://axios-http.com/",
  [Tool.Clerk]: "https://clerk.com/",
  [Tool.FramerMotion]: "https://www.framer.com/motion/",
  [Tool.JSZip]: "https://stuk.github.io/jszip/",
  [Tool.Sonner]: "https://sonner.emilkowal.ski/",
  [Tool.Tailwind]: "https://tailwindcss.com/",
  [Tool.Typescript]: "https://www.typescriptlang.org/",
  [Tool.Electron]: "https://www.electronjs.org/",
  [Tool.NodeJs]: "https://nodejs.org/",
  [Tool.Javascript]:
    "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics",
  [Tool.SCSS]: "https://sass-lang.com/",
  [Tool.Python]: "https://www.python.org/",
  [Tool.MYSQL]: "https://www.mysql.com/",
  [Tool.CSharp]:
    "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/",
  [Tool.Jest]: "https://jestjs.io/",
  [Tool.React]: "https://react.dev/",
  [Tool.Bootstrap]: "https://getbootstrap.com/",
  [Tool.Flask]: "https://flask.palletsprojects.com/en/3.0.x/",
  [Tool.Express]: "https://expressjs.com/",
  [Tool.Webpack]: "https://webpack.js.org/",
  [Tool.Babel]: "https://babeljs.io/",
  [Tool.Parcel]: "https://parceljs.org/",
  [Tool.MongoDB]: "https://www.mongodb.com/",
  [Tool.FireStore]: "https://firebase.google.com/docs/firestore",
  [Tool.SanityCMS]: "https://www.sanity.io/",
  [Tool.Vite]: "https://vitejs.dev/",
};

export const works: {
  title: string;
  desc: string;
  tools: Tool[];
  links: { state: WorkState; url: string }[];
  highlighted?: boolean;
  inProgress?: boolean;
  hide?: boolean;
}[] = [
  {
    title: "44DB Website",
    desc: "Website done for the super producer collective 44DB.",
    tools: [Tool.Typescript, Tool.React, Tool.SanityCMS, Tool.Vite, Tool.SCSS],
    links: [
      { state: WorkState.Live, url: "https://44db.net" },
      { state: WorkState.Code, url: "https://github.com/tochibedford/44Site" },
    ],
    highlighted: true,
  },
  {
    title: "QUERCi",
    desc: "A Desktop/Web Application for File and Music stems sharing.",
    tools: [
      Tool.Axios,
      Tool.Clerk,
      Tool.FramerMotion,
      Tool.Tailwind,
      Tool.Typescript,
      Tool.Electron,
      Tool.Vite,
    ],
    inProgress: true,
    links: [
      { state: WorkState.Live, url: "https://querci.xyz" },
      {
        state: WorkState.Windows,
        url: "https://github.com/tochibedford/querci_desktop/releases/0.2",
      },
      {
        state: WorkState.MacOs,
        url: "https://github.com/tochibedford/querci_desktop/releases/0.2",
      },
    ],
    highlighted: true,
  },
  {
    title: "Green Thumbs",
    desc: "This is an astro template/starter-kit for a gardening website",
    tools: [Tool.Typescript, Tool.Astro, Tool.Tailwind, Tool.SCSS],
    links: [
      {
        state: WorkState.Live,
        url: "https://green-thumb-gardening.vercel.app",
      },
      {
        state: WorkState.Code,
        url: "https://github.com/tochibedford/green_thumb",
      },
    ],
    highlighted: false,
  },
  {
    title: "Reduse",
    desc: "A cli tool for image conversion in a web repo. Use this to automagically convert all images in a repo to a certain format as well as fix everywhere the images were imported in your files. It will also honour your .gitIgnore rules",
    tools: [Tool.Typescript, Tool.Glob, Tool.Sharp],
    links: [
      {
        state: WorkState.NPM,
        url: "https://www.npmjs.com/package/reduse",
      },
      {
        state: WorkState.Code,
        url: "https://github.com/tochibedford/reduse",
      },
    ],
    highlighted: false,
  },
];

export const tools: {
  groupName: string;
  groupItems: Tool[];
}[] = [
  {
    groupName: "Languages",
    groupItems: [
      Tool.Typescript,
      Tool.Javascript,
      Tool.C,
      Tool.Rust,
      Tool.Python,
    ],
  },
  {
    groupName: "FrameWorks/Libraries (javascript/typescript)",
    groupItems: [
      Tool.Astro,
      Tool.React,
      Tool.Electron,
      Tool.JSZip,
      Tool.Tailwind,
      Tool.Express,
      Tool.Axios,
      Tool.Flask,
      Tool.Sonner,
      Tool.Vite,
      Tool.MongoDB,
      Tool.FramerMotion,
      Tool.Glob,
    ],
  },
];
