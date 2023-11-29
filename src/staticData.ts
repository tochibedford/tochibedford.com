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
  Live,
  Code,
}

export const highlightedWork = [];

export enum Tool {
  Typescript = "Typescript",
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
  highlighted?: boolean;
}[] = [
  {
    title: "44DB Website",
    desc: "Website done for the super producer collective 44DB.",
    tools: [Tool.Typescript, Tool.React, Tool.SanityCMS, Tool.Vite, Tool.SCSS],
    highlighted: true,
  },
  {
    title: "44DB Website",
    desc: "Website done for the super producer collective 44DB.",
    tools: [Tool.Typescript, Tool.React, Tool.SanityCMS, Tool.Vite, Tool.SCSS],
    highlighted: true,
  },
  {
    title: "44DB Website",
    desc: "Website done for the super producer collective 44DB.",
    tools: [Tool.Typescript, Tool.React, Tool.SanityCMS, Tool.Vite, Tool.SCSS],
    highlighted: false,
  },
];
