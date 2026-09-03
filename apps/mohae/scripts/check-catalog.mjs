import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/sample-data.js", import.meta.url), "utf8");
const { opportunities } = await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(source)}`);

function metersBetween(a, b) {
  const toRadians = (value) => value * Math.PI / 180;
  const latitude = toRadians(b.latitude - a.latitude);
  const longitude = toRadians(b.longitude - a.longitude);
  const arc = Math.sin(latitude / 2) ** 2
    + Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(longitude / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(arc));
}

assert.equal(opportunities.length, 20);
assert.equal(new Set(opportunities.map(({ id }) => id)).size, opportunities.length);
assert.deepEqual(
  [...new Set(opportunities.map(({ collectionContext }) => collectionContext.id))].sort(),
  ["michelin-guide-korea-2026", "naver-hidden-archive"],
);

for (const item of opportunities) {
  assert.ok(item.title && item.subtitle && item.images[0], `${item.id}: missing card content`);
  assert.ok(item.collectionContext.targetType === "external_source", `${item.id}: missing source chip`);
  assert.ok(Number.isFinite(item.latitude) && Number.isFinite(item.longitude), `${item.id}: missing coordinates`);
  assert.match(item.externalLinks.map, /map\.naver\.com\/p\/entry\/place\/\d+/, `${item.id}: missing exact NAVER Place link`);
  assert.ok(item.schedule && item.schedule !== "운영시간 미확인", `${item.id}: missing observed schedule`);
  assert.match(item.price, /[0-9]|미확인|무료|별도|포함/, `${item.id}: missing observed or explicit-unknown price`);
  const identity = item.sourceIdentity;
  assert.ok(identity?.sourceAddress && identity.naverAddress && identity.naverName, `${item.id}: missing source-to-NAVER identity evidence`);
  const distance = metersBetween(
    { latitude: identity.sourceLatitude, longitude: identity.sourceLongitude },
    { latitude: identity.naverLatitude, longitude: identity.naverLongitude },
  );
  const nearSource = distance <= 100;
  const documentedCurrentGuideMatch = identity.naverMichelin2026 === true && identity.caveat;
  assert.ok(nearSource || documentedCurrentGuideMatch, `${item.id}: NAVER place is ${Math.round(distance)}m from source without a documented current-guide match`);
  const signal = item.source.signal;
  assert.ok(["issued_credential", "published_coverage", "emergent_pattern"].includes(signal.provenanceClass), `${item.id}: missing Signal provenance class`);
  assert.ok(signal.signalType && ["place", "opportunity"].includes(signal.targetType), `${item.id}: incomplete structured Signal`);
  assert.ok(["credential_chip", "context_chip", "internal_only"].includes(signal.displayMode), `${item.id}: invalid Signal display mode`);
  if (item.collectionContext.id === "michelin-guide-korea-2026") {
    assert.equal(identity.naverMichelin2026, true, `${item.id}: selected NAVER card lacks the 2026 MICHELIN badge`);
    if (signal.signalType === "michelin_star") {
      const count = signal.numericValue;
      assert.ok(Number.isInteger(count) && count >= 1 && count <= 3, `${item.id}: invalid MICHELIN star count`);
      assert.equal(signal.numericUnit, "star", `${item.id}: invalid MICHELIN star unit`);
      assert.equal(signal.displayMode, "credential_chip", `${item.id}: star credential chip must be visible`);
      assert.equal(signal.label, `${count} Star${count === 1 ? "" : "s"}`, `${item.id}: MICHELIN star label and value disagree`);
    } else if (signal.signalType === "michelin_bib_gourmand") {
      assert.equal(signal.numericValue, null, `${item.id}: Bib Gourmand cannot carry a numeric value`);
      assert.equal(signal.displayMode, "credential_chip", `${item.id}: Bib Gourmand chip must be visible`);
      assert.equal(signal.label, "Bib Gourmand", `${item.id}: invalid Bib Gourmand label`);
    } else {
      assert.equal(signal.signalType, "michelin_guide_selection", `${item.id}: unknown MICHELIN Signal type`);
      assert.equal(signal.numericValue, null, `${item.id}: guide selection cannot carry a numeric value`);
      assert.equal(signal.displayMode, "internal_only", `${item.id}: plain guide selection must not render a white chip`);
      assert.equal(signal.label, "2026 Selection", `${item.id}: invalid 2026 selection label`);
    }
  }
  for (const menu of item.menu) {
    assert.ok(menu.name && menu.price, `${item.id}: incomplete representative menu item`);
  }
}

console.log(`catalog ok: ${opportunities.length} places from 2 sources`);
