export async function registerWebMcpTools(explore) {
  if (typeof document.modelContext?.registerTool !== "function") {
    console.info("MOHAE WebMCP tools are unavailable in this browser.");
    return false;
  }

  const tools = [
    {
      name: "get_map_context",
      description: "List the user's planned stops and saved MOHAE opportunities currently shown on the shared map.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async () => explore.getMapContext(),
    },
    {
      name: "add_map_stop",
      description: "Add a hotel, airport, attraction, restaurant, or other stop to the user's visible MOHAE map and itinerary.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 120, description: "Visible place name." },
          kind: {
            type: "string",
            enum: ["accommodation", "airport", "attraction", "restaurant", "other"],
            description: "Role of this place in the trip or outing.",
          },
          latitude: { type: "number", minimum: -90, maximum: 90, description: "Verified WGS84 latitude." },
          longitude: { type: "number", minimum: -180, maximum: 180, description: "Verified WGS84 longitude." },
          visitAt: { type: "string", format: "date-time", description: "Optional ISO 8601 planned visit time." },
          order: { type: "integer", minimum: 1, description: "Optional visit order in the current itinerary." },
          note: { type: "string", maxLength: 240, description: "Optional reason, booking detail, or planning note." },
        },
        required: ["name", "kind", "latitude", "longitude"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async (input) => ({ added: true, stop: explore.addPlanStop(input) }),
    },
    {
      name: "focus_map_place",
      description: "Open the shared map and focus one saved opportunity or planned stop by its mapId.",
      inputSchema: {
        type: "object",
        properties: {
          mapId: { type: "string", description: "A mapId returned by get_map_context or add_map_stop." },
        },
        required: ["mapId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async ({ mapId }) => ({ focused: true, place: explore.focusMapPlace(mapId) }),
    },
    {
      name: "recommend_near_place",
      description: "Read curated MOHAE opportunities near one planned stop or saved opportunity without changing the current screen.",
      inputSchema: {
        type: "object",
        properties: {
          mapId: { type: "string", description: "A mapId returned by get_map_context or add_map_stop." },
          radiusKm: { type: "number", minimum: 0.1, maximum: 100, default: 10, description: "Maximum straight-line distance in kilometers." },
          limit: { type: "integer", minimum: 1, maximum: 20, default: 5, description: "Maximum number of recommendations." },
        },
        required: ["mapId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: async ({ mapId, radiusKm = 10, limit = 5 }) => ({
        mapId,
        recommendations: explore.recommendNearPlace(mapId, radiusKm, limit),
      }),
    },
    {
      name: "explore_near_place",
      description: "Open the MOHAE swipe deck filtered and ordered around one place already recorded on the shared map.",
      inputSchema: {
        type: "object",
        properties: {
          mapId: { type: "string", description: "A mapId returned by get_map_context or add_map_stop." },
          radiusKm: { type: "number", minimum: 0.1, maximum: 100, default: 10, description: "Visible recommendation radius in kilometers." },
        },
        required: ["mapId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async ({ mapId, radiusKm = 10 }) => ({
        opened: true,
        context: explore.exploreNearPlace(mapId, radiusKm),
      }),
    },
  ];

  for (const tool of tools) await document.modelContext.registerTool(tool);
  console.info(`Registered ${tools.length} MOHAE WebMCP tools.`);
  return true;
}
