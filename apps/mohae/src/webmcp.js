const PLACE_CATEGORIES = ["restaurant", "bar", "cafe", "bakery", "culture", "activity", "shopping", "other"];
const ANCHOR_ROLES = ["accommodation", "airport", "must_visit", "booked", "other"];
const CATEGORY_LABELS = {
  restaurant: "음식점",
  bar: "바·주점",
  cafe: "카페·디저트",
  bakery: "베이커리",
  culture: "문화·예술",
  activity: "놀거리·힐링",
  shopping: "쇼핑",
  other: "장소",
};

function cleanText(value, maxLength, fallback = "") {
  const text = String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (text || fallback).slice(0, maxLength);
}

function requiredText(value, field, maxLength) {
  const text = cleanText(value, maxLength);
  if (!text) throw new Error(`${field} is required.`);
  return text;
}

function optionalCoordinate(value, field, minimum, maximum) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum || number > maximum) throw new Error(`${field} is invalid.`);
  return number;
}

function safeHttpsUrl(value, field) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${field} must be a valid HTTPS URL.`);
  }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error(`${field} must be a valid HTTPS URL.`);
  return url.href;
}

function isoDateTime(value, field) {
  const text = requiredText(value, field, 64);
  const timestamp = new Date(text);
  if (Number.isNaN(timestamp.getTime())) throw new Error(`${field} must be a valid date-time.`);
  return timestamp.toISOString();
}

function stableId(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function mapType(category) {
  if (["restaurant", "bar"].includes(category)) return "restaurant";
  if (["cafe", "bakery"].includes(category)) return "cafe";
  if (["culture", "activity"].includes(category)) return "culture";
  return "other";
}

function normalizeAnchor(input) {
  const role = ANCHOR_ROLES.includes(input?.role) ? input.role : "other";
  const title = requiredText(input?.title, "anchor.title", 120);
  const latitude = optionalCoordinate(input?.latitude, "anchor.latitude", -90, 90);
  const longitude = optionalCoordinate(input?.longitude, "anchor.longitude", -180, 180);
  if (latitude === null || longitude === null) throw new Error("Anchors require latitude and longitude.");
  return {
    id: `anchor:${stableId(`${role}:${title}:${latitude}:${longitude}`)}`,
    role,
    title,
    address: cleanText(input?.address, 180),
    latitude,
    longitude,
  };
}

function normalizeExternalCandidate(input, reason) {
  const title = requiredText(input?.title, "external.title", 120);
  const category = PLACE_CATEGORIES.includes(input?.category) ? input.category : "other";
  const location = requiredText(input?.location, "external.location", 100);
  const address = cleanText(input?.address, 180, location);
  const latitude = optionalCoordinate(input?.latitude, "external.latitude", -90, 90);
  const longitude = optionalCoordinate(input?.longitude, "external.longitude", -180, 180);
  if ((latitude === null) !== (longitude === null)) throw new Error("External candidates require both latitude and longitude or neither.");
  const sourceUrl = safeHttpsUrl(input?.sourceUrl, "external.sourceUrl");
  const sourceLabel = requiredText(input?.sourceLabel, "external.sourceLabel", 80);
  const observedAt = isoDateTime(input?.observedAt, "external.observedAt");
  const imageUrl = input?.imageUrl ? safeHttpsUrl(input.imageUrl, "external.imageUrl") : "card-image-fallback.png";
  const id = `external:${stableId(`${sourceUrl}:${title}:${address}`)}`;
  const subtitle = cleanText(input?.subtitle, 180, reason || "Agent가 외부에서 찾은 검토 후보");
  const signal = {
    id,
    title,
    category,
    location,
    address,
    latitude,
    longitude,
    schedule: cleanText(input?.schedule, 120, "확인 필요"),
    price: cleanText(input?.price, 80, "확인 필요"),
    subtitle,
    sourceUrl,
    sourceLabel,
    observedAt,
    imageUrl,
    capturedAt: new Date().toISOString(),
    admissionStatus: "external",
  };
  return {
    signal,
    candidate: {
      id,
      externalSignalId: id,
      origin: "external",
      admissionStatus: "external",
      verification: "agent_unverified",
      kind: "place",
      group: "place",
      title,
      subtitle,
      detailHighlight: "Agent 외부 조사 후보 · MOHAE 검증 전",
      description: subtitle,
      category: CATEGORY_LABELS[category],
      location,
      address,
      latitude,
      longitude,
      schedule: signal.schedule,
      price: signal.price,
      distance: "",
      reason,
      discovery: reason,
      images: [imageUrl],
      photoMeta: [{ source: sourceLabel, title: "외부 조사 자료" }],
      selectionContext: { label: "Agent 조사 · 검토 필요", tone: "neutral", signalType: "agent_external" },
      externalLinks: { official: sourceUrl, officialLabel: sourceLabel },
      source: { url: sourceUrl, label: sourceLabel, observedAt },
      sources: [{ source: "agent_external", sourceLabel, placeUrl: sourceUrl, signal: "agent_research" }],
      sourceIds: [id],
      sourceLabels: [sourceLabel],
      placeUrl: sourceUrl,
      imageUrl,
      mapType: mapType(category),
      mapSubtype: category,
      categories: [CATEGORY_LABELS[category]],
      collectionLabels: [],
      localizationSearchText: `${title} ${location} ${address}`,
    },
  };
}

function normalizeExploration(input, map) {
  if (!input || typeof input !== "object") throw new Error("Exploration input is required.");
  const title = requiredText(input.title, "title", 100);
  if (!Array.isArray(input.candidates) || !input.candidates.length || input.candidates.length > 20) {
    throw new Error("candidates must contain between 1 and 20 entries.");
  }
  const anchors = (input.anchors ?? []).map(normalizeAnchor);
  if (anchors.length > 12) throw new Error("anchors cannot exceed 12 entries.");
  const candidates = [];
  const externalSignals = [];
  for (const entry of input.candidates) {
    const reason = cleanText(entry?.reason, 240);
    const hasCatalog = Boolean(cleanText(entry?.catalogId, 160));
    const hasExternal = Boolean(entry?.external && typeof entry.external === "object");
    if (hasCatalog === hasExternal) throw new Error("Each candidate requires exactly one catalogId or external object.");
    if (hasCatalog) {
      candidates.push(map.resolveCatalogCandidate({ catalogId: cleanText(entry.catalogId, 160), reason }));
      continue;
    }
    const normalized = normalizeExternalCandidate(entry.external, reason);
    candidates.push(normalized.candidate);
    externalSignals.push(normalized.signal);
  }
  return {
    title,
    mode: input.mode === "route" ? "route" : "exploration",
    contextLabel: cleanText(input.contextLabel, 160),
    anchors,
    candidates,
    externalSignals,
    createdAt: new Date().toISOString(),
  };
}

const searchSchema = {
  type: "object",
  properties: {
    area: { type: "string", maxLength: 100, description: "Optional Korean area, address, or place-name text." },
    useCurrentLocation: { type: "boolean", default: false, description: "Use the location explicitly granted through the MOHAE map." },
    latitude: { type: "number", minimum: -90, maximum: 90 },
    longitude: { type: "number", minimum: -180, maximum: 180 },
    radiusKm: { type: "number", minimum: 0.1, maximum: 100, default: 5 },
    categories: { type: "array", maxItems: 8, items: { type: "string", enum: PLACE_CATEGORIES } },
    limit: { type: "integer", minimum: 1, maximum: 80, default: 40 },
  },
  additionalProperties: false,
};

const placeSourceSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1, maxLength: 120 },
    category: { type: "string", enum: PLACE_CATEGORIES },
    location: { type: "string", minLength: 1, maxLength: 100 },
    address: { type: "string", maxLength: 180 },
    latitude: { type: "number", minimum: -90, maximum: 90 },
    longitude: { type: "number", minimum: -180, maximum: 180 },
    schedule: { type: "string", maxLength: 120 },
    price: { type: "string", maxLength: 80 },
    subtitle: { type: "string", maxLength: 180 },
    sourceUrl: { type: "string", format: "uri", maxLength: 2048 },
    sourceLabel: { type: "string", minLength: 1, maxLength: 80 },
    observedAt: { type: "string", format: "date-time" },
    imageUrl: { type: "string", format: "uri", maxLength: 2048 },
  },
  required: ["title", "category", "location", "sourceUrl", "sourceLabel", "observedAt"],
  additionalProperties: false,
};

const presentSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1, maxLength: 100 },
    mode: { type: "string", enum: ["exploration", "route"], default: "exploration", description: "Use route only for an ordered final itinerary proposal; it numbers candidates in the supplied order without claiming travel-time optimization." },
    contextLabel: { type: "string", maxLength: 160 },
    anchors: {
      type: "array",
      maxItems: 12,
      items: {
        type: "object",
        properties: {
          role: { type: "string", enum: ANCHOR_ROLES },
          title: { type: "string", minLength: 1, maxLength: 120 },
          address: { type: "string", maxLength: 180 },
          latitude: { type: "number", minimum: -90, maximum: 90 },
          longitude: { type: "number", minimum: -180, maximum: 180 },
        },
        required: ["role", "title", "latitude", "longitude"],
        additionalProperties: false,
      },
    },
    candidates: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: {
        type: "object",
        properties: {
          catalogId: { type: "string", maxLength: 160 },
          reason: { type: "string", maxLength: 240 },
          external: placeSourceSchema,
        },
        additionalProperties: false,
      },
    },
  },
  required: ["title", "candidates"],
  additionalProperties: false,
};

const tripNoteSchema = {
  type: "object",
  properties: {
    text: { type: "string", minLength: 1, maxLength: 600, description: "Preserve the traveler's natural-language wording instead of replacing it with an inferred preference label." },
    referencedPlaceIds: {
      type: "array",
      maxItems: 20,
      items: { type: "string", minLength: 1, maxLength: 180 },
      description: "Optional current-scene place ids explicitly referenced by the traveler.",
    },
  },
  required: ["text"],
  additionalProperties: false,
};

const emptySchema = { type: "object", properties: {}, additionalProperties: false };

export async function registerWebMcpTools({ map, explore, groupTrip }) {
  const tools = [
    {
      name: "search_mohae_places",
      description: "Search the existing MOHAE place catalog by area, category, or a user-approved current location. Returns provenance and admission state without changing the page.",
      inputSchema: searchSchema,
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async (input) => map.searchPlaces(input),
    },
    {
      name: "present_exploration",
      description: "Replace the visible MOHAE Explore deck and map with one ordered scene of catalog places and separately tagged external research candidates. In an active host trip room, the scene is also shared with invited travelers. Route mode only visualizes the supplied order; it does not claim optimized travel times. External candidates remain unverified signals and are not admitted to the main catalog.",
      inputSchema: presentSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, untrustedContentHint: true },
      execute: async (input) => explore.presentExploration(normalizeExploration(input, map)),
    },
    {
      name: "add_group_trip_note",
      description: "Append the current traveler's natural-language situation, constraint, or must-do request to the shared trip room. Preserve the user's wording; do not collapse it into must/pass/veto labels. The page attributes the note to the joined traveler.",
      inputSchema: tripNoteSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, untrustedContentHint: true },
      execute: async (input) => groupTrip.addNote(input),
    },
    {
      name: "get_group_trip_context",
      description: "Read the latest shared trip-room snapshot: each traveler's independent save/pass actions, map selections, raw natural-language notes, readiness, anchors, and current candidates. Use this evidence to explain conflicts and propose an approximate ordered plan; do not treat pass as a hard veto.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async () => groupTrip.getContext(),
    },
  ];
  if (typeof document.modelContext?.registerTool !== "function") {
    console.info("MOHAE WebMCP tools are unavailable in this browser.");
    return false;
  }
  for (const tool of tools) await document.modelContext.registerTool(tool);
  console.info(`Registered ${tools.length} MOHAE WebMCP tools.`);
  return true;
}
