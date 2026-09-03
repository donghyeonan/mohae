import { createId } from "./core.js";
import { createExploreFeature } from "./explore.js";
import { createGroupTripFeature } from "./group-trip.js";
import { createMapFeature } from "./map.js";
import { createProfileFeature } from "./profile.js";
import { registerWebMcpTools } from "./webmcp.js";

const STORAGE_KEY = "mohae-prototype-v2";

function initialState() {
  const now = new Date().toISOString();
  return {
    activeTab: "explore",
    view: "explore",
    filter: "all",
    photoIndices: {},
    decisions: {},
    exploreBatchIds: [],
    exploreSeenIds: [],
    saved: {},
    activeExploration: null,
    externalSignals: {},
    currentLocation: null,
    activeCollectionId: null,
    mapSheetState: "collapsed",
    mapCollectionFilter: null,
    mapTypeFilter: null,
    eventLog: [],
    exposed: {},
    profile: {
      authenticated: false,
      displayName: "",
      locale: "ko",
      homeRegion: "",
    },
  };
}

function loadState() {
  const defaults = initialState();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return defaults;
    const current = Object.fromEntries(Object.keys(defaults)
      .filter((key) => Object.hasOwn(parsed, key))
      .map((key) => [key, parsed[key]]));
    return {
      ...defaults,
      ...current,
      profile: { ...defaults.profile, ...(parsed.profile ?? {}) },
      exploreBatchIds: Array.isArray(parsed.exploreBatchIds) ? parsed.exploreBatchIds : [],
      exploreSeenIds: Array.isArray(parsed.exploreSeenIds) ? parsed.exploreSeenIds : [],
    };
  } catch {
    return defaults;
  }
}

let state = loadState();
let groupTrip = null;
const app = document.querySelector("#app");
const bottomNav = document.querySelector("#bottomNav");
const toast = document.querySelector("#toast");
let toastTimer;

function saveState() {
  const { currentLocation: _sessionOnlyLocation, ...persistedState } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
}

saveState();

function recordEvent(type, opportunityId = null, metadata = {}) {
  const event = {
    id: createId("event"),
    type,
    at: new Date().toISOString(),
    opportunityId,
    recommendationId: opportunityId && !/^(external|catalog):/.test(opportunityId) ? `seoul-gyeonggi-w35:${opportunityId}` : null,
    context: { filter: state.filter, view: state.view },
    metadata,
  };
  state.eventLog = [...state.eventLog, event];
  saveState();
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function syncNavigation() {
  for (const button of bottomNav.querySelectorAll("[data-tab]")) {
    const active = button.dataset.tab === state.activeTab;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }
}

const context = {
  app,
  bottomNav,
  get state() {
    return state;
  },
  get groupTrip() {
    return groupTrip;
  },
  recordEvent,
  saveState,
  showToast,
  syncNavigation,
  render,
};

const explore = createExploreFeature(context);
const map = createMapFeature(context);
const profile = createProfileFeature(context);
groupTrip = createGroupTripFeature(context);

function render() {
  if (state.view === "map") map.render();
  else {
    map.deactivate();
    if (state.view === "profile") profile.render();
    else explore.render();
  }
}

document.querySelector(".phone").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action], [data-map-action], [data-map-filter-group], [data-group-action]");
  if (!button) return;
  if (groupTrip.handleAction(button)) return;
  if (map.handleAction(button)) return;
  if (explore.handleAction(button)) return;
  profile.handleAction(button);
});

bottomNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  state.activeTab = button.dataset.tab === "map" ? "map" : "explore";
  state.view = state.activeTab;
  if (state.activeTab === "map") state.activeCollectionId = null;
  saveState();
  render();
});

document.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  if (event.key === "Escape") {
    if (explore.handleEscape()) event.preventDefault();
    return;
  }
  if (explore.handleKeyboard(event.key)) event.preventDefault();
});

if (state.activeTab === "profile") {
  state.activeTab = "explore";
  state.view = "explore";
} else if (!new Set(["explore", "detail", "map", "profile"]).has(state.view)) state.view = "explore";
render();
void groupTrip.initialize();

registerWebMcpTools({ map, explore, groupTrip }).catch((error) => {
  console.error("Failed to register MOHAE WebMCP tools.", error);
});
