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
  "collectionContext",
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
  if (!record.externalLinks?.map) {
    errors.push(`${record.id}: missing map source`);
  }
  if (record.recommendationReasons) {
    errors.push(`${record.id}: generic recommendation reasons are excluded`);
  }
  if (!/^mohae-[a-z0-9-]+$/.test(record.collectionContext?.id ?? "") || !/^MOHAE\s/.test(record.collectionContext?.label ?? "") || record.collectionContext?.kind !== "curated_collection" || record.collectionContext?.targetType !== "internal_map" || record.collectionContext?.curationStatus !== "prototype_curated") {
    errors.push(`${record.id}: invalid curated collection context`);
  }
  const signalChips = record.signalChips ?? [];
  const diningSignalKinds = new Set(["culinary_selection", "competition_award", "media_appearance", "international_editorial", "craft_affiliation"]);
  const eventSignalKinds = new Set(["participant", "attendee_payoff"]);
  const externalSourceRoles = new Set(["guide", "competition_organizer", "media", "editorial", "platform"]);
  const chipTones = new Set(["blue_ribbon", "michelin", "competition", "media", "editorial", "participant", "payoff"]);
  if (!Array.isArray(signalChips) || signalChips.length > 3 || signalChips.some((chip) => chip.interactive !== false || !chip.label || !chip.kind || !chipTones.has(chip.tone) || !chip.sourceLabel || !externalSourceRoles.has(chip.sourceRole) || !/^https:\/\//.test(chip.sourceUrl ?? "") || Number.isNaN(Date.parse(chip.observedAt)) || !chip.scope || /self_report/i.test(chip.scope))) {
    errors.push(`${record.id}: invalid signal chip provenance`);
  }
  const allowedSignalKinds = ["식당", "카페", "바"].includes(record.category) ? diningSignalKinds : eventSignalKinds;
  if (signalChips.some((chip) => !allowedSignalKinds.has(chip.kind))) {
    errors.push(`${record.id}: signal chip kind is not allowed for this category`);
  }
  if (record.reviewPatterns || record.reviewInsight || record.reviewSummary) {
    errors.push(`${record.id}: review-derived summaries are excluded from this contract sample`);
  }
  if (record.menuMedia?.some((media) => !media.title || !media.src || !media.source || !media.sourceUrl || !media.rightsStatus)) {
    errors.push(`${record.id}: incomplete menu media provenance`);
  }
  if (record.menuCoverage && record.menuCoverage.imageCount !== (record.menuMedia?.length ?? 0)) {
    errors.push(`${record.id}: menuCoverage.imageCount does not match menuMedia`);
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
  external_signal_chips: records.reduce((sum, record) => sum + (record.signalChips?.length ?? 0), 0),
  generic_recommendation_reasons: 0,
  review_summaries: 0,
  errors: 0,
}, null, 2));
