import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(projectRoot, process.argv[2] === "dist" ? "dist" : ".");
const port = Number(process.env.PORT || 4173);
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".woff2":"font/woff2", ".txt":"text/plain; charset=utf-8" };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.endsWith("/") ? `${pathname.slice(1)}index.html` : pathname.slice(1);
    const publicPath = resolve(root, "public", relative);
    const ownPath = resolve(root, root === projectRoot && relative !== "index.html" && relative.endsWith("index.html") ? join("pages", relative) : relative);
    let path = ownPath;
    if (root === projectRoot && !relative.startsWith("src/")) {
      try { if ((await stat(publicPath)).isFile()) path = publicPath; } catch {}
    }
    if (!path.startsWith(root + sep)) throw new Error("Invalid path");
    const data = await readFile(path);
    res.writeHead(200, { "content-type": mime[extname(path)] || "application/octet-stream", "x-content-type-options":"nosniff" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type":"text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Preview: http://127.0.0.1:${port}/`));
