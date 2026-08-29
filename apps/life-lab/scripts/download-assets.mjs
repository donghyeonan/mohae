import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const assets = [
  ["pottery-1.jpg", "nXYmYO_-JUk"],
  ["pottery-2.jpg", "7ZK_CuHroq4"],
  ["pottery-3.jpg", "wrEHW8QaeYw"],
  ["jazz-1.jpg", "A10y2Eq7OHY"],
  ["jazz-2.jpg", "mFxIRtdBmNU"],
  ["cafe-1.jpg", "ZOOiTO1zrik"],
  ["cafe-2.jpg", "RDAk2GFt2uQ"],
  ["climbing-1.jpg", "h2NlwNkA2h8"],
  ["climbing-2.jpg", "TDhpTIK-neM"],
  ["art-1.jpg", "1xp5VxvyKL0"],
  ["art-2.jpg", "JNTSoyb_bbw"],
];

await mkdir(join(root, "assets"), { recursive: true });
for (const [filename, id] of assets) {
  const url = `https://unsplash.com/photos/${id}/download?force=true&w=1600`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${filename}: HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) throw new Error(`${filename}: ${contentType}`);
  const destination = join(root, "assets", filename);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  console.log(`${filename} <- ${id}`);
}
