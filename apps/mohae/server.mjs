import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
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
  [".svg", "image/svg+xml"],
]);

async function localEnvironment() {
  try {
    const body = await readFile(join(root, ".env.local"), "utf8");
    return Object.fromEntries(body.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      return match ? [[match[1], match[2].trim().replace(/^['\"]|['\"]$/g, "")]] : [];
    }));
  } catch {
    return {};
  }
}

const localEnv = await localEnvironment();
const runtimeConfig = {
  naverMapClientId: process.env.NAVER_MAP_CLIENT_ID
    ?? process.env.VITE_NAVER_MAP_CLIENT_ID
    ?? localEnv.NAVER_MAP_CLIENT_ID
    ?? localEnv.VITE_NAVER_MAP_CLIENT_ID
    ?? "",
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? localEnv.VITE_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? localEnv.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  if (pathname === "/runtime-config.js") {
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": "text/javascript; charset=utf-8",
    });
    response.end(`window.__MOHAE_CONFIG__ = ${JSON.stringify(runtimeConfig)};`);
    return;
  }
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
    console.log(`MOHAE prototype: http://localhost:${address.port}`);
  }
});
