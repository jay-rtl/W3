import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
if (dist !== join(root, "dist")) throw new Error("Unexpected build target");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "index.html"), join(dist, "index.html"));
await cp(join(root, "pages"), join(dist), { recursive: true });
await cp(join(root, "src"), join(dist, "src"), { recursive: true });
await cp(join(root, "public"), dist, { recursive: true });
if (process.env.SITE_URL) {
  const site = new URL(process.env.SITE_URL);
  if (site.protocol !== "https:" || !site.pathname.endsWith("/") || site.search || site.hash) {
    throw new Error("SITE_URL must be an HTTPS site URL ending in /, for example https://example.com/W3/");
  }
  const base = site.pathname;
  const routes = ["", "about/", "services/", "work/", "process/", "contact/"];
  for (const route of routes) {
    const pageUrl = new URL(route, site).href;
    const htmlPath = join(dist, route, "index.html");
    const html = (await readFile(htmlPath, "utf8"))
      .replace('content="/og-preview.svg"', `content="${site.href}og-preview.svg"`)
      .replace(/(href|src)="\/(?!\/)/g, `$1="${base}`)
      .replace("</head>", `  <link rel="canonical" href="${pageUrl}">\n  <meta property="og:url" content="${pageUrl}">\n</head>`);
    await writeFile(htmlPath, html);
  }
  const cssPath = join(dist, "src", "style.css");
  const css = (await readFile(cssPath, "utf8")).replaceAll('url("/', `url("${base}`);
  await writeFile(cssPath, css);
  await writeFile(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${new URL(route, site).href}</loc></url>`).join("")}</urlset>\n`);
  await writeFile(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.href}sitemap.xml\n`);
}
console.log(`Built static site at ${dist}`);
