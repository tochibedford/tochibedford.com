// The site is one page plus the résumé, so the sitemap is written by hand.
const SITE = "https://tochibedford.com";
const urls = ["/", "/tochukwu-bedford-resume.pdf", "/llms.txt"];

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
