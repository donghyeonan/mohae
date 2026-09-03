import assert from "node:assert/strict";
import { MAP_TYPE_FILTER_GROUPS, mapFilterMatches, mapSubtypeForEntry, mapTypeForEntry } from "../src/map-filter.js";
import { mapPlaceGroups } from "../src/map-places.js";

const bakery = { categories: ["베이커리"], currentCategory: "베이커리" };
const shopping = { categories: ["쇼핑", "편집숍"], currentCategory: "쇼핑" };
const activity = { categories: ["공원"], currentCategory: "공원" };
const event = { entryType: "event", categories: ["전시"], currentCategory: "미디어 전시" };
const eventChip = MAP_TYPE_FILTER_GROUPS.flatMap(({ items }) => items).find(({ value }) => value === "event");
assert.equal(eventChip.label, "팝업·행사");
assert.equal(eventChip.donut, true);

assert.equal(mapSubtypeForEntry(bakery), "bakery");
assert.equal(mapTypeForEntry(bakery), "cafe");
assert.equal(mapFilterMatches({ type: "cafe", subtype: "bakery" }, "cafe"), true);

assert.equal(mapSubtypeForEntry(shopping), "shopping");
assert.equal(mapTypeForEntry(shopping), "culture");
assert.equal(mapFilterMatches({ type: "culture", subtype: "shopping" }, "culture"), true);

assert.equal(mapSubtypeForEntry(activity), "activity");
assert.equal(mapFilterMatches({ type: "culture", subtype: "activity" }, "culture"), false);
assert.equal(mapFilterMatches({ type: "culture", subtype: "activity" }, "activity"), true);

assert.equal(mapSubtypeForEntry(event), "event");
assert.equal(mapTypeForEntry(event), "event");
assert.equal(mapFilterMatches({ type: "event", subtype: "event" }, "event"), true);
assert.equal(mapFilterMatches({ type: "culture", subtype: "culture" }, "event"), false);

const coexEvents = [
  { id: "event:frieze", latitude: 37.5117365, longitude: 127.0593412, type: "event" },
  { id: "event:kiaf", latitude: 37.5117365, longitude: 127.0593412, type: "event" },
];
for (const zoom of [15, 19, 21]) {
  const groups = mapPlaceGroups(coexEvents, zoom);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].places.length, 2);
  assert.equal(groups[0].terminalCollision, true);
}

console.log("map filter contract ok: merged categories, blue events, exact-coordinate collision preview");
