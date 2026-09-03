async function loadCatalog({ refresh = false } = {}) {
  await (window.__MOHAE_CONFIG_READY__ ?? Promise.resolve(window.__MOHAE_CONFIG__));
  const { supabaseUrl, supabasePublishableKey } = window.__MOHAE_CONFIG__ ?? {};
  if (!supabaseUrl || !supabasePublishableKey) throw new Error("Supabase public config missing");
  const query = new URLSearchParams({
    select: "id,source_index_position,admission_status,matched_explore_id,payload,explore_payload",
    order: "source_index_position.asc",
  });
  if (refresh) query.set("offset", "0");
  const response = await fetch(`${supabaseUrl}/rest/v1/mohae_source_entries?${query}`, {
    headers: { apikey: supabasePublishableKey },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase catalog request failed: ${response.status}`);
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows.length) throw new Error("Supabase catalog is empty");
  if (new Set(rows.map(({ id }) => id)).size !== rows.length) throw new Error("Supabase catalog contains duplicate ids");
  return rows;
}

let catalogRows;
try {
  catalogRows = await loadCatalog();
} catch (error) {
  const app = document.querySelector("#app");
  if (app) app.innerHTML = '<section class="screen deck-empty"><span>✦</span><h2>장소를 불러오지 못했어요</h2><p>잠시 뒤 다시 열어주세요.</p></section>';
  throw error;
}

export let sourceIndexEntries = [];
export let admissionReviewBySourceId = {};

function applyCatalog(rows) {
  catalogRows = rows;
  sourceIndexEntries = rows.map(({ payload }) => payload);
  admissionReviewBySourceId = Object.fromEntries(rows.map((row) => [row.id, {
    status: row.admission_status,
    matchedExploreId: row.matched_explore_id,
    explorePayload: row.explore_payload,
  }]));
}

applyCatalog(catalogRows);

export async function refreshSourceCatalog() {
  const rows = await loadCatalog({ refresh: true });
  applyCatalog(rows);
  return rows.length;
}
