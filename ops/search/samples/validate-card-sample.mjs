import fs from "node:fs";
import path from "node:path";

const inputPath = path.resolve(process.argv[2] ?? new URL("./2026-08-30-card-10.json", import.meta.url).pathname);
const records = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const required = [
  "id",
  "subjectId",
  "naverPlaceId",
  "kind",
  "category",
  "title",
  "subtitle",
  "location",
  "schedule",
  "price",
  "actionText",
  "primaryAction",
  "images",
  "photoMeta",
  "latitude",
  "longitude",
  "status",
  "official",
  "source",
  "address",
  "externalLinks",
];
const errors = [];
const heroOrigins = new Set(["official_site", "merchant_provided_map", "provider_exterior", "rights_cleared_editorial", "licensed_official_editorial"]);
const forbiddenHeroOrigins = /visitor|review|blog|clip|pai|aiview|user/i;

if (!Array.isArray(records)) errors.push("root must be an array");

for (const record of Array.isArray(records) ? records : []) {
  for (const field of required) {
    if (record[field] === null || record[field] === undefined || record[field] === "") {
      errors.push(`${record.id ?? "unknown"}: missing ${field}`);
    }
  }
  if (!Array.isArray(record.images) || record.images.length < 1 || record.images.length > 3) {
    errors.push(`${record.id}: images must contain 1-3 URLs`);
  }
  if (record.images?.length !== record.photoMeta?.length) {
    errors.push(`${record.id}: images and photoMeta lengths differ`);
  }
  if (!record.photoMeta?.every((photo) => photo.source && photo.sourceUrl && photo.role && photo.rightsStatus && photo.origin && photo.observedAt)) {
    errors.push(`${record.id}: incomplete photo provenance`);
  }
  const hero = record.photoMeta?.[0];
  if (!hero?.heroEligible || !heroOrigins.has(hero.origin) || forbiddenHeroOrigins.test(`${hero.origin} ${hero.source} ${hero.role}`)) {
    errors.push(`${record.id}: hero is not eligible under the official → provider exterior → rights-cleared editorial policy`);
  }
  if (!record.primaryAction?.label || !/^https:\/\//.test(record.primaryAction?.url ?? "")) {
    errors.push(`${record.id}: invalid primaryAction`);
  }
  if (!record.source?.observedAt || Number.isNaN(Date.parse(record.source.observedAt))) {
    errors.push(`${record.id}: invalid observedAt`);
  }
  if (!record.externalLinks?.map || !record.externalLinks?.reviews) {
    errors.push(`${record.id}: missing map or review source`);
  }
  if (!Number.isFinite(record.latitude) || !Number.isFinite(record.longitude)) {
    errors.push(`${record.id}: invalid coordinates`);
  }
  if (!["open", "limited", "closed"].includes(record.status?.tone)) {
    errors.push(`${record.id}: invalid status tone`);
  }
  if (/무료/.test(record.price) && /미확인|unknown/i.test(record.price)) {
    errors.push(`${record.id}: unknown price cannot be presented as free`);
  }
}

if (new Set((records ?? []).map((record) => record.id)).size !== records.length) {
  errors.push("duplicate record id");
}
if (new Set((records ?? []).map((record) => record.subjectId)).size !== records.length) {
  errors.push("duplicate subjectId");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  file: inputPath,
  records: records.length,
  representative_visual: records.length,
  explicit_rights_status: records.length,
  primary_action: records.length,
  observed_at: records.length,
  errors: 0,
}, null, 2));
