import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { canonicalizeMapPlaces, mapPlaceGroups } from "../src/map-places.js";

const { entries } = JSON.parse(await readFile("ops/search/runs/2026-09-02-full-source-index/source-index.json", "utf8"));
const mapped = entries
  .filter((entry) => entry.businessStatus !== "closed" && entry.businessStatus !== "deleted_unknown")
  .filter(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude))
  .map((entry) => ({
    ...entry,
    name: entry.localizations?.["ko-KR"]?.name ?? entry.name,
    address: entry.localizations?.["ko-KR"]?.address ?? entry.address,
    type: "restaurant",
    localizationSearchText: "",
  }));
const places = canonicalizeMapPlaces(mapped);

assert.equal(mapped.length, 503);
assert.equal(places.length, 490);

const wooraeok = places.filter(({ name }) => name === "우래옥");
assert.equal(wooraeok.length, 1);
assert.deepEqual(wooraeok[0].sourceIds, ["hidden:11679381", "michelin:512038"]);
assert.deepEqual(wooraeok[0].sources.map(({ source }) => source), ["hidden_archive", "michelin_2026"]);

const soulAndEgg = places.filter(({ name }) => name === "소울" || name === "에그 앤 플라워");
assert.equal(soulAndEgg.length, 2);
const normalZoom = mapPlaceGroups(soulAndEgg, 18);
assert.equal(normalZoom.length, 1);
assert.equal(normalZoom[0].terminalCollision, false);
const terminalZoom = mapPlaceGroups(soulAndEgg, 19);
assert.equal(terminalZoom.length, 1);
assert.equal(terminalZoom[0].terminalCollision, true);
assert.deepEqual(terminalZoom[0].places.map(({ name }) => name), ["소울", "에그 앤 플라워"]);

const ordinaryOverlap = places.filter(({ name }) => name === "세븐스도어" || name === "톡톡");
assert.equal(ordinaryOverlap.length, 2);
const ordinaryAtTerminalZoom = mapPlaceGroups(ordinaryOverlap, 19);
assert.equal(ordinaryAtTerminalZoom.length, 2);
assert.equal(ordinaryAtTerminalZoom.some(({ terminalCollision }) => terminalCollision), false);

console.log(JSON.stringify({ sourceRecords: mapped.length, canonicalPlaces: places.length, auditedMerges: mapped.length - places.length, terminalCollision: terminalZoom[0].places.map(({ name }) => name), ordinaryOverlap: ordinaryAtTerminalZoom.map(({ places: group }) => group[0].name) }));
