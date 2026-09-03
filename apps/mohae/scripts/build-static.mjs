import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([
  cp(join(root, "index.html"), join(dist, "index.html")),
  cp(join(root, "styles.css"), join(dist, "styles.css")),
  cp(join(root, "assets"), join(dist, "assets"), { recursive: true }),
  cp(join(root, "src"), join(dist, "src"), { recursive: true }),
]);
const config = {
  naverMapClientId: process.env.VITE_NAVER_MAP_CLIENT_ID ?? process.env.NAVER_MAP_CLIENT_ID ?? "",
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
};
await writeFile(join(dist, "runtime-config.js"), `window.__MOHAE_CONFIG__ = ${JSON.stringify(config)};\nwindow.__MOHAE_CONFIG_READY__ = Promise.resolve(window.__MOHAE_CONFIG__);\n`);
console.log(`built ${dist}`);
