import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
]);

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const file = join(root, normalized);

  try {
    const info = await stat(file);
    if (!info.isFile() || !file.startsWith(root)) throw new Error("not found");
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentTypes.get(extname(file)) ?? "application/octet-stream",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(process.env.PORT ?? 4177, () => {
  const address = server.address();
  if (typeof address === "object" && address) {
    console.log(`Life Lab Tinder clone: http://localhost:${address.port}`);
  }
});
