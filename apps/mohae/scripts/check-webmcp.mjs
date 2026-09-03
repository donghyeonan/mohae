import assert from "node:assert/strict";
import { registerWebMcpTools } from "../src/webmcp.js";

const registered = new Map();
globalThis.document = {
  modelContext: {
    async registerTool(tool) {
      registered.set(tool.name, tool);
    },
  },
};

let presented;
const map = {
  searchPlaces(input) {
    return { query: input, places: [{ catalogId: "hidden:1", name: "기존 장소" }] };
  },
  resolveCatalogCandidate({ catalogId, reason }) {
    return {
      id: "place-1",
      catalogId,
      origin: "catalog",
      admissionStatus: "admitted",
      title: "기존 장소",
      reason,
      images: ["fallback.png"],
    };
  },
};
const explore = {
  presentExploration(scene) {
    presented = scene;
    return { shownCount: scene.candidates.length, externalSignalCount: scene.externalSignals.length };
  },
};
let recordedNote;
const groupTrip = {
  addNote(input) {
    recordedNote = input;
    return { recorded: true, text: input.text };
  },
  getContext() {
    return { room: { memberCount: 3 }, members: [] };
  },
};

assert.equal(await registerWebMcpTools({ map, explore, groupTrip }), true);
assert.deepEqual([...registered.keys()], ["search_mohae_places", "present_exploration", "add_group_trip_note", "get_group_trip_context"]);

const searchResult = await registered.get("search_mohae_places").execute({ area: "성수", categories: ["restaurant"], limit: 20 });
assert.equal(searchResult.places[0].catalogId, "hidden:1");
assert.equal(searchResult.query.area, "성수");

const result = await registered.get("present_exploration").execute({
  title: "성수 저녁 후보",
  mode: "route",
  contextLabel: "내일 저녁 · 성수",
  anchors: [{ role: "must_visit", title: "성수역", latitude: 37.5446, longitude: 127.0559 }],
  candidates: [
    { catalogId: "hidden:1", reason: "기존 MOHAE 후보" },
    {
      reason: "Agent가 추가 조사한 후보",
      external: {
        title: "외부 후보",
        category: "restaurant",
        location: "서울 성동구",
        address: "서울 성동구 연무장길 1",
        latitude: 37.543,
        longitude: 127.057,
        schedule: "화–일 17:00–22:00",
        price: "1인 약 30,000원",
        subtitle: "저녁에 가볍게 들를 수 있는 식당",
        sourceUrl: "https://example.com/place",
        sourceLabel: "공식 페이지",
        observedAt: "2026-09-03T10:00:00+09:00",
        imageUrl: "https://example.com/place.jpg"
      },
    },
  ],
});

assert.equal(result.shownCount, 2);
assert.equal(result.externalSignalCount, 1);
assert.equal(presented.mode, "route");
assert.equal(presented.candidates[0].origin, "catalog");
assert.equal(presented.candidates[1].origin, "external");
assert.equal(presented.candidates[1].admissionStatus, "external");
assert.equal(presented.candidates[1].reason, "Agent가 추가 조사한 후보");
assert.equal(presented.externalSignals[0].id, presented.candidates[1].externalSignalId);
assert.equal(presented.anchors[0].role, "must_visit");

const noteResult = await registered.get("add_group_trip_note").execute({
  text: "나는 오늘 많이 걷기 힘들고 곱창은 꼭 먹고 싶어",
  referencedPlaceIds: ["place-1"],
});
assert.equal(noteResult.recorded, true);
assert.equal(recordedNote.text, "나는 오늘 많이 걷기 힘들고 곱창은 꼭 먹고 싶어");
assert.equal((await registered.get("get_group_trip_context").execute({})).room.memberCount, 3);

await assert.rejects(
  () => registered.get("present_exploration").execute({
    title: "unsafe",
    candidates: [{
      external: {
        title: "unsafe",
        category: "restaurant",
        location: "서울",
        sourceUrl: "javascript:alert(1)",
        sourceLabel: "bad",
        observedAt: "2026-09-03T10:00:00+09:00"
      },
    }],
  }),
  /HTTPS/,
);

console.log(JSON.stringify({ tools: registered.size, candidates: presented.candidates.length, status: "ok" }));
