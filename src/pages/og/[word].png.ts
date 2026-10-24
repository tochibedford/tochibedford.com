import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { entries, PAGE_WORDS, SITE, type Entry } from "../../data/work";

// Link-preview images, one per word page, drawn at build time: the site's blue with its title,
// meta line and the opening of the first paragraph, like the card that opens on the page.
const W = 1200;
const H = 630;
const C = { ground: "#1a2cf0", chalk: "#f4f2ec", blush: "#ffb9cc", deep: "#08104f" };
const ROWS = ["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const font = (pkg: string, file: string) => readFileSync(join(process.cwd(), "node_modules/@fontsource", pkg, "files", file));
const fonts = [
  { name: "Unbounded", data: font("unbounded", "unbounded-latin-800-normal.woff"), weight: 800 as const },
  { name: "DM Mono", data: font("dm-mono", "dm-mono-latin-400-normal.woff"), weight: 400 as const },
  { name: "Hanken Grotesk", data: font("hanken-grotesk", "hanken-grotesk-latin-400-normal.woff"), weight: 400 as const },
];

// satori takes React-shaped elements; this builds them without pulling in React
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

const plain = (html: string) => html.replace(/<[^>]+>/g, "");
const clip = (t: string, n: number) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(" ", n - 1)).replace(/[,.;:]$/, "") + "…");
// long titles step down so they stay on two lines at most
const titleSize = (t: string) => (t.length <= 12 ? 112 : t.length <= 22 ? 86 : 70);

function card(e: Entry): Node {
  // the keyboard, faint behind everything; the letters of this word come up a little brighter
  const inWord = new Set(e.word.toUpperCase());
  const keyboard = h(
    "div",
    { position: "absolute", top: -10, left: 20, display: "flex", flexDirection: "column", gap: 4 },
    ...ROWS.map((row, r) =>
      h(
        "div",
        { display: "flex", gap: 34, marginLeft: r * 34 },
        ...[...row].map((k) =>
          h("div", { fontFamily: "Unbounded", fontSize: 150, lineHeight: 1, color: C.chalk, opacity: inWord.has(k) ? 0.13 : 0.05 }, k)
        )
      )
    )
  );
  return h(
    "div",
    { width: W, height: H, display: "flex", position: "relative", background: C.ground, color: C.chalk, overflow: "hidden" },
    keyboard,
    h(
      "div",
      { position: "absolute", inset: 0, padding: "64px 76px 60px", display: "flex", flexDirection: "column" },
      h(
        "div",
        { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 },
        h("div", { fontFamily: "DM Mono", fontSize: 26, opacity: 0.85 }, e.meta),
        h(
          "div",
          { fontFamily: "DM Mono", fontSize: 24, background: C.blush, color: C.deep, padding: "12px 24px", borderRadius: 999 },
          `${SITE.replace(/^https?:\/\//, "")}/${e.word}`
        )
      ),
      h(
        "div",
        { display: "flex", flexDirection: "column", marginTop: "auto", gap: 26 },
        h("div", { fontFamily: "Unbounded", fontSize: titleSize(e.title), lineHeight: 0.95, letterSpacing: "-0.04em" }, e.title),
        h("div", { fontFamily: "Hanken Grotesk", fontSize: 30, lineHeight: 1.4, opacity: 0.9, maxWidth: 1000 }, clip(plain(e.body[0]), 170)),
        h("div", { fontFamily: "DM Mono", fontSize: 22, opacity: 0.6 }, `Type “${e.word}” to play it.`)
      )
    )
  );
}

export function getStaticPaths() {
  return entries.filter((e) => PAGE_WORDS.has(e.word)).map((entry) => ({ params: { word: entry.word }, props: { entry } }));
}

export async function GET({ props }: { props: { entry: Entry } }) {
  const svg = await satori(card(props.entry) as any, { width: W, height: H, fonts });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
}
