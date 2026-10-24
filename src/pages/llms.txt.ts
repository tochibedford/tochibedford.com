import { entries, GROUPS, EMAIL, RESUME_PDF } from "../data/work";

// A plain-text version of the whole site for AI agents and anything else that reads text
// rather than a canvas instrument (see llmstxt.org). Built from the same data as the page.
const SITE = "https://tochibedford.com";
const plain = (html: string) =>
  html.replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, "$2 ($1)").replace(/<[^>]+>/g, "");
const link = (href: string) => (href.startsWith("/") ? SITE + href : href);

export function GET() {
  const about = entries.find((e) => e.word === "about")!;
  const lines: string[] = [
    "# Tochi Bedford",
    "",
    "> Tochukwu (Tochi) Bedford is a senior software engineer in Los Angeles, writing code since 2017 across web, mobile, desktop and backend.",
    "",
    ...about.body.flatMap((b) => [plain(b), ""]),
    `- Email: ${EMAIL}`,
    `- Résumé (PDF): ${SITE}${RESUME_PDF}`,
    "- GitHub: https://github.com/tochibedford",
    "- LinkedIn: https://www.linkedin.com/in/tochukwu-bedford/",
    "- X: https://x.com/TochiBedford",
    "",
  ];
  const essay = entries.find((e) => e.word === "generalist")!;
  lines.push(`## ${essay.title}`, "", ...essay.body.flatMap((b) => [plain(b), ""]));
  for (const g of GROUPS) {
    if (g === "Me") continue;
    const items = entries.filter((e) => e.group === g);
    if (!items.length) continue;
    lines.push(`## ${g}`, "");
    for (const e of items) {
      lines.push(`### ${e.title}`, `${e.meta}`, "");
      lines.push(...e.body.flatMap((b) => [plain(b), ""]));
      if (e.note) lines.push(e.note, "");
      if (e.stack?.length) lines.push(`Stack: ${e.stack.join(", ")}`, "");
      if (e.links?.length) lines.push(...e.links.map((l) => `- ${l.label}: ${link(l.href)}`), "");
    }
  }
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
