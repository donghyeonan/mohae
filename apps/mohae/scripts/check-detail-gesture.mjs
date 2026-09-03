import assert from "node:assert/strict";
import { detailReturnGesture } from "../src/gestures.js";

assert.equal(detailReturnGesture({ startX: 190, startY: 160, endX: 190, endY: 650, scrollTop: 0 }), "vertical");
assert.equal(detailReturnGesture({ startX: 190, startY: 160, endX: 190, endY: 650, scrollTop: 180 }), null);
assert.equal(detailReturnGesture({ startX: 100, startY: 300, endX: 220, endY: 305, scrollTop: 0 }), "horizontal");
assert.equal(detailReturnGesture({ startX: 190, startY: 650, endX: 190, endY: 160, scrollTop: 0 }), null);
console.log(JSON.stringify({ gestures: 4, status: "ok" }));
