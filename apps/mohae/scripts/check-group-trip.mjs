import assert from "node:assert/strict";
import { summarizeTripSnapshot } from "../src/group-trip.js";

const snapshot = {
  room: {
    title: "세 사람의 서울 저녁",
    stage: "collecting",
    sceneRevision: 2,
    expiresAt: "2026-09-04T05:00:00+09:00",
    scene: {
      title: "서울 저녁 후보",
      contextLabel: "명동 숙소 · 4시간",
      anchors: [{ id: "anchor:hotel", title: "명동 숙소", role: "accommodation" }],
      candidates: [
        { id: "place-a", catalogId: "catalog-a", title: "전시 A", location: "한남", latitude: 37.5, longitude: 127.0, origin: "catalog" },
        { id: "place-b", catalogId: "catalog-b", title: "식당 B", location: "을지로", latitude: 37.56, longitude: 126.99, origin: "catalog" },
      ],
    },
  },
  members: [
    { id: "member-1", displayName: "민지", role: "host", ready: true },
    { id: "member-2", displayName: "현수", role: "member", ready: false },
  ],
  events: [
    { id: 1, memberId: "member-1", type: "choice", createdAt: "2026-09-03T20:00:00+09:00", payload: { placeId: "place-a", placeTitle: "전시 A", decision: "passed", surface: "card", sceneRevision: 2 } },
    { id: 2, memberId: "member-1", type: "choice", createdAt: "2026-09-03T20:01:00+09:00", payload: { placeId: "place-a", placeTitle: "전시 A", decision: "saved", surface: "map", sceneRevision: 2 } },
    { id: 3, memberId: "member-2", type: "choice", createdAt: "2026-09-03T20:02:00+09:00", payload: { placeId: "place-a", placeTitle: "전시 A", decision: "passed", surface: "card", sceneRevision: 2 } },
    { id: 4, memberId: "member-1", type: "note", createdAt: "2026-09-03T20:03:00+09:00", payload: { text: "나는 많이 걷기 힘들어", referencedPlaceIds: [], sceneRevision: 2 } },
    { id: 5, memberId: "member-2", type: "choice", createdAt: "2026-09-03T19:00:00+09:00", payload: { placeId: "place-b", placeTitle: "식당 B", decision: "saved", surface: "card", sceneRevision: 1 } },
  ],
};

const context = summarizeTripSnapshot(snapshot);
assert.equal(context.room.memberCount, 2);
assert.equal(context.room.readyCount, 1);
assert.equal(context.scene.candidates[0].order, 1);
assert.equal(context.members[0].choices.length, 1);
assert.equal(context.members[0].choices[0].decision, "saved", "latest choice wins within the current scene revision");
assert.equal(context.members[0].choices[0].surface, "map");
assert.equal(context.members[0].notes[0].text, "나는 많이 걷기 힘들어");
assert.equal(context.members[1].choices.length, 1);
assert.equal(context.placeSignals[0].savedBy[0], "민지");
assert.equal(context.placeSignals[0].passedBy[0], "현수");
assert.equal(context.placeSignals.some(({ placeId }) => placeId === "place-b"), false, "old scene choices do not leak into the current proposal");

console.log(JSON.stringify({ members: context.room.memberCount, signals: context.placeSignals.length, status: "ok" }));
