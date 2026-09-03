export const DAY_MS = 24 * 60 * 60 * 1000;

const iconPaths = {
  arrowLeft: '<path d="m15 18-6-6 6-6"/>',
  map: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  filter: '<path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6a5.5 5.5 0 0 0 1-8.8Z"/>',
  chevronUp: '<path d="m18 15-6-6-6 6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  calendar: '<path d="M8 2v4M16 2v4M3 10h18"/><rect width="18" height="18" x="3" y="4" rx="2"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V6"/><path d="M16 13h.01"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 17V8a3 3 0 0 1 3-3h7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  focus: '<circle cx="12" cy="12" r="3"/><path d="M3 12a9 9 0 0 1 9-9M21 12a9 9 0 0 1-9 9M12 21a9 9 0 0 1-9-9M12 3a9 9 0 0 1 9 9"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  plane: '<path d="M22 2 9 15"/><path d="m22 2-7 20-4-9-9-4Z"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"/><path d="m9 12 2 2 4-4"/>',
  login: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
  sparkles: '<path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z"/><path d="m5 14 .8 1.7L7.5 16l-1.7.7L5 18.5l-.8-1.8L2.5 16l1.7-.3Z"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M9 13h6"/>',
  ribbon: '<circle cx="12" cy="8" r="5"/><path d="m8.5 12-1 9 4.5-3 4.5 3-1-9"/>',
  star: '<path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.6l-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="m8.2 13.6-1.2 8 5-3 5 3-1.2-8"/>',
  play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/>',
  building: '<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
  landmark: '<path d="m3 10 9-6 9 6M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M3 21h18"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 5-5c0-3-3.8-5-9-5Z"/><circle cx="7.5" cy="10" r=".7"/><circle cx="9" cy="6.5" r=".7"/><circle cx="14" cy="6" r=".7"/><circle cx="17" cy="9" r=".7"/>',
  leaf: '<path d="M20 4C12 4 5 8 5 15c0 3 2 5 5 5 7 0 10-8 10-16Z"/><path d="M4 21c3-6 7-9 13-12"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M7.5 8C5 8 4 6.5 4.8 5.2 6 3.2 10 5 12 8M16.5 8c2.5 0 3.5-1.5 2.7-2.8C18 3.2 14 5 12 8"/>',
  bookOpen: '<path d="M2 5a8 8 0 0 1 10 2v14A8 8 0 0 0 2 19ZM22 5a8 8 0 0 0-10 2v14a8 8 0 0 1 10-2Z"/>',
  externalLink: '<path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
};

export function icon(name, className = "") {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] ?? ""}</svg>`;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function addDays(value, days) {
  return new Date(new Date(value).getTime() + days * DAY_MS).toISOString();
}

export function createId(prefix) {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}
