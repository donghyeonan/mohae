import { createId } from "./core.js";
import { createExploreFeature } from "./explore.js";
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
    saved: {},
    plannedStops: [],
    selectedMapId: null,
    nearbyAnchor: null,
    reviewOpenId: null,
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
    return {
      ...defaults,
      ...parsed,
      profile: { ...defaults.profile, ...(parsed.profile ?? {}) },
      plannedStops: Array.isArray(parsed.plannedStops) ? parsed.plannedStops : [],
    };
  } catch {
    return defaults;
  }
}

let state = loadState();
const app = document.querySelector("#app");
const bottomNav = document.querySelector("#bottomNav");
const toast = document.querySelector("#toast");
let toastTimer;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function recordEvent(type, opportunityId = null, metadata = {}) {
  const event = {
    id: createId("event"),
    type,
    at: new Date().toISOString(),
    opportunityId,
    recommendationId: opportunityId ? `seoul-gyeonggi-w35:${opportunityId}` : null,
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
  recordEvent,
  saveState,
  showToast,
  syncNavigation,
  render,
};

const explore = createExploreFeature(context);
const profile = createProfileFeature(context);

function render() {
  if (state.view === "profile") profile.render();
  else explore.render();
}

document.querySelector(".phone").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (explore.handleAction(button)) return;
  profile.handleAction(button);
});

bottomNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  state.activeTab = button.dataset.tab === "profile" ? "profile" : "explore";
  state.view = state.activeTab;
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

if (state.activeTab === "profile") state.view = "profile";
else if (!new Set(["explore", "detail", "map"]).has(state.view)) state.view = "explore";
render();

registerWebMcpTools(explore).catch((error) => {
  console.error("Failed to register MOHAE WebMCP tools.", error);
});
