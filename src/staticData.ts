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
