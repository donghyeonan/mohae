import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const index = JSON.parse(await readFile(new URL("../../../ops/search/runs/2026-09-02-full-source-index/source-index.json", import.meta.url)));
const unavailable = index.entries.filter(({ businessStatus }) => businessStatus === "closed" || businessStatus === "deleted_unknown");
const hags = index.entries.find(({ name }) => name === "해그스");
assert.equal(index.entries.length, 539);
assert.equal(unavailable.length, 36);
assert.equal(index.entries.length - unavailable.length, 503);
assert.equal(hags.placeRecordStatus, "exact_id_missing");
assert.equal(hags.businessStatus, "closed");
assert.equal(hags.effectiveLastOperationDate, "2025-06-14");
console.log(JSON.stringify({ sourceRecords: 539, currentMapPlaces: 503, excludedClosedOrUnknown: 36, status: "ok" }));
