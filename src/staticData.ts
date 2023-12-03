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
  SCSS = "SCSS",
  SASS = "SASS",
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

export const works: {
  title: string;
  desc: string;
  tools: Tool[];
  links: { state: WorkState; url: string }[];
  highlighted?: boolean;
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
