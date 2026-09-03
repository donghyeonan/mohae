import { placeSubtype, placeType } from "./place-type.js";

export const MAP_TYPE_FILTER_GROUPS = [
  { tone: "restaurant", items: [{ value: "restaurant", label: "음식점", donut: true }, { value: "bar", label: "바·주점" }] },
  { tone: "cafe", items: [{ value: "cafe", label: "카페·디저트", donut: true }] },
  { tone: "culture", items: [{ value: "culture", label: "문화·예술", donut: true }, { value: "activity", label: "놀거리·힐링" }] },
  { tone: "event", items: [{ value: "event", label: "팝업·행사", donut: true }] },
];

export const MAP_TYPE_LABELS = {
  restaurant: "음식점",
  cafe: "카페·디저트",
  culture: "문화·예술",
  event: "팝업·행사",
  other: "기타",
};

export function mapSubtypeForEntry(entry) {
  return entry.entryType === "event" ? "event" : placeSubtype(entry);
}

export function mapTypeForEntry(entry) {
  return entry.entryType === "event" ? "event" : placeType(entry);
}

export function mapFilterMatches(place, value) {
  if (!value) return true;
  if (value === "event") return place.type === "event";
  if (value === "cafe") return place.subtype === "cafe" || place.subtype === "bakery";
  if (value === "culture") return place.subtype === "culture" || place.subtype === "shopping";
  return place.subtype === value;
}
