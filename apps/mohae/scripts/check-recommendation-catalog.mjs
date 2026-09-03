import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const artifact = JSON.parse(await readFile(join(root, "ops/search/runs/2026-09-03-recommendation-review/results/recommendation-catalog-updates.json"), "utf8"));
const items = artifact.updates.map(({ admission_status, explore_payload }) => ({ ...explore_payload, admissionStatus: admission_status }));
const candidates = items.filter(({ admissionStatus }) => admissionStatus === "candidate");
const required = ["id", "title", "category", "location", "address", "latitude", "longitude", "schedule", "price", "source", "images"];

if (items.length !== 272 || new Set(items.map(({ id }) => id)).size !== 272) throw new Error("expected 272 unique recommendation items");
for (const item of items) {
  for (const field of required) if (item[field] === null || item[field] === undefined || item[field] === "") throw new Error(`${item.id}: missing ${field}`);
  if (!Array.isArray(item.images) || !item.images.length) throw new Error(`${item.id}: missing image`);
}
await access(join(root, "apps/mohae/assets/place-candidate.svg"));
if (candidates.some(({ images }) => images[0] === "/assets/place-candidate.svg" || !/^https?:/.test(images[0]))) throw new Error("candidate missing approved representative image");
const splitMenu = candidates.find(({ title }) => title === "키친205 홍대점");
if (splitMenu?.price !== "딸기밭케이크 미니 35,000원" || splitMenu.menu?.length !== 3 || splitMenu.menu[0]?.price !== "35,000원" || splitMenu.menu.some(({ description }) => description !== "네이버 플레이스 표시")) throw new Error("multi-item price text was not split into the shared menu template");
if (splitMenu.collectionContext?.id !== "naver-hidden-archive" || splitMenu.collectionContext?.targetType !== "external_source" || splitMenu.selectionContext?.label !== "딸기: 맛있을게" || splitMenu.selectionContext?.tone !== "editorial") throw new Error("Hidden Archive source chips were not preserved");
const genericHidden = candidates.find(({ title }) => title === "등마루");
if (genericHidden?.collectionContext?.label !== "NAVER Hidden Archive" || genericHidden.selectionContext !== null) throw new Error("generic Hidden Archive chip was duplicated");

const seen = new Set();
let batches = 0;
while (seen.size < items.length) {
  const batch = items.filter(({ id }) => !seen.has(id)).slice(0, 20);
  if (!batch.length) throw new Error("batching stalled");
  batch.forEach(({ id }) => seen.add(id));
  batches += 1;
}
if (batches !== 14) throw new Error(`expected 14 batches, got ${batches}`);
console.log(`recommendation catalog ok: ${items.length} places, ${batches} batches, no duplicate ids`);
