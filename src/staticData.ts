import githubIcon from "./components/assets/github.svg";
import twitterIcon from "./components/assets/twitter.svg";
import instagramIcon from "./components/assets/instagram.svg";
import type { ImageMetadata } from "astro";

export const navMenuItems: {
  idName: string;
  displayName: string;
  link: string;
  isExternal: boolean;
}[] = [
  {
    idName: "articles",
    displayName: "Articles",
    link: "/articles",
    isExternal: false,
  },
  {
    idName: "resume",
    displayName: "Resume",
    link: "/resume",
    isExternal: false,
  },
  {
    idName: "experiments",
    displayName: "Experiments",
    link: "/experiments",
    isExternal: false,
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
}

export enum Tool {
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
    desc: "Website done for the super producer collective 44DB.",
    tools: [
      Tool.Axios,
      Tool.Clerk,
      Tool.FramerMotion,
      Tool.Tailwind,
      Tool.Typescript,
      Tool.Electron,
      Tool.NodeJs,
      Tool.Vite,
    ],
    links: [
      { state: WorkState.Live, url: "https://44db.net" },
      { state: WorkState.Code, url: "https://github.com/tochibedford/44Site" },
    ],
    highlighted: true,
  },
  {
    title: "44DB Website",
    desc: "Website done for the super producer collective 44DB.",
    tools: [Tool.Typescript, Tool.React, Tool.SanityCMS, Tool.Vite, Tool.SCSS],
    links: [
      { state: WorkState.Live, url: "https://44db.net" },
      { state: WorkState.Code, url: "https://github.com/tochibedford/44Site" },
    ],
    highlighted: false,
  },
];
