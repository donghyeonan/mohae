import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { localizationSearchText, localizeRecord } from "../src/i18n.js";

const index = JSON.parse(await readFile(new URL("../../../ops/search/runs/2026-09-02-full-source-index/source-index.json", import.meta.url)));
const michelin = index.entries.filter(({ source }) => source === "michelin_2026");
assert.equal(michelin.length, 237);
assert.ok(michelin.every(({ localizations }) => localizations?.["en-KR"]?.name && localizations?.["ko-KR"]?.name));
assert.ok(michelin.every((entry) => localizeRecord(entry, "en").name === entry.name));
assert.ok(michelin.every((entry) => /[가-힣]/.test(localizeRecord(entry, "ko").description)));
const jinmi = michelin.find(({ placeId }) => placeId === "511961");
assert.equal(localizeRecord(jinmi, "ko").name, "진미식당");
assert.equal(localizeRecord(jinmi, "en").name, "Jinmi Sikdang");
assert.match(localizationSearchText(jinmi), /진미식당/);
assert.match(localizationSearchText(jinmi), /Jinmi Sikdang/);
console.log(JSON.stringify({ records: michelin.length, locales: ["ko-KR", "en-KR"], status: "ok" }));
