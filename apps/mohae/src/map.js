import { searchCatalogPlaces, catalogAreaSearchText } from "./catalog-search.js";
import { addDays, escapeHtml, icon } from "./core.js";
import { admissionReviewBySourceId, sourceIndexEntries } from "./data.js";
import { localizationSearchText, localizeRecord } from "./i18n.js";
import { MAP_TYPE_FILTER_GROUPS, MAP_TYPE_LABELS, mapFilterMatches, mapSubtypeForEntry, mapTypeForEntry } from "./map-filter.js";
import { canonicalizeMapPlaces, mapPlaceGroups } from "./map-places.js";

const DEFAULT_MAP_VIEW = { latitude: 37.56096, longitude: 126.98624, zoom: 15 };

let naverMapsPromise;
let naverMapsAuthError;

function loadNaverMaps(clientId) {
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);
  if (naverMapsPromise) return naverMapsPromise;
  naverMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const fail = (error) => {
      script.remove();
      reject(error);
    };
    const previousAuthFailure = window.navermap_authFailure;
    window.navermap_authFailure = () => {
      naverMapsAuthError = new Error("NAVER Maps authentication failed for this host");
      window.dispatchEvent(new CustomEvent("mohae:naver-auth-failure"));
      if (typeof previousAuthFailure === "function") previousAuthFailure();
      fail(naverMapsAuthError);
    };
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.onload = () => window.naver?.maps
      ? resolve(window.naver.maps)
      : fail(new Error("NAVER Maps unavailable"));
    script.onerror = () => fail(new Error("NAVER Maps failed to load"));
    document.head.appendChild(script);
  }).catch((error) => {
    naverMapsPromise = undefined;
    throw error;
  });
  return naverMapsPromise;
}

function savedMarkerContent(count = 1, type = "other", showCount = false) {
  return `<div class="mohae-donut-marker is-${escapeHtml(type)}${showCount ? " is-count" : ""}" aria-label="${escapeHtml(MAP_TYPE_LABELS[type])} ${escapeHtml(count)}곳">${showCount ? `<span>+${escapeHtml(count)}</span>` : ""}</div>`;
}

function locationMarkerContent(title) {
  return `<div class="mohae-location-marker" aria-label="${escapeHtml(title)} 위치"><span></span></div>`;
}

function routeMarkerContent(order, title) {
  return `<div class="mohae-route-marker" aria-label="${escapeHtml(order)}번째 일정 ${escapeHtml(title)}"><span>${escapeHtml(order)}</span></div>`;
}

async function configuredNaverMaps() {
  if (naverMapsAuthError) throw naverMapsAuthError;
  await (window.__MOHAE_CONFIG_READY__ ?? Promise.resolve(window.__MOHAE_CONFIG__));
  const clientId = window.__MOHAE_CONFIG__?.naverMapClientId?.trim();
  if (!clientId) throw new Error("NAVER Map client id missing");
  return loadNaverMaps(clientId);
}

export async function mountNaverMapPreview(node, { latitude, longitude, title }) {
  if (!node || !Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Invalid map preview target");
  const maps = await configuredNaverMaps();
  const position = new maps.LatLng(latitude, longitude);
  const zoomControlOptions = { position: maps.Position.RIGHT_CENTER };
  if (maps.ZoomControlStyle?.SMALL) zoomControlOptions.style = maps.ZoomControlStyle.SMALL;
  const previewMap = new maps.Map(node, {
    center: position,
    zoom: 14,
    minZoom: 6,
    maxZoom: 21,
    draggable: true,
    pinchZoom: true,
    scrollWheel: false,
    keyboardShortcuts: true,
    disableDoubleTapZoom: false,
    disableDoubleClickZoom: false,
    zoomControl: true,
    zoomControlOptions,
    mapDataControl: false,
    scaleControl: false,
    logoControlOptions: { position: maps.Position.TOP_LEFT },
  });
  const marker = new maps.Marker({
    map: previewMap,
    position,
    title,
    zIndex: 100,
    icon: {
      content: locationMarkerContent(title),
      size: new maps.Size(28, 34),
      anchor: new maps.Point(14, 34),
    },
  });
  const resizeObserver = new ResizeObserver(() => previewMap.refresh?.());
  resizeObserver.observe(node);
  node.classList.add("is-ready");
  return () => {
    resizeObserver.disconnect();
    marker.setMap(null);
    if (typeof previewMap.destroy === "function") previewMap.destroy();
  };
}

function filterButtons(groups, group, selected) {
  return groups.map(({ tone, items }) => `<span class="mohae-map-chip-pair">${items.map((item) => `<button class="is-${escapeHtml(tone)}" type="button" data-map-filter-group="${group}" data-value="${item.value}" aria-pressed="${selected === item.value}">${item.donut ? '<i aria-hidden="true"></i>' : ""}${escapeHtml(item.label)}</button>`).join("")}</span>`).join("");
}

export function createMapFeature(context) {
  const mapPlaces = canonicalizeMapPlaces(sourceIndexEntries
    .filter((entry) => entry.businessStatus !== "closed" && entry.businessStatus !== "deleted_unknown")
    .map((entry) => ({
      ...localizeRecord(entry, context.state.profile.locale),
      type: mapTypeForEntry(entry),
      subtype: mapSubtypeForEntry(entry),
      areaSearchText: catalogAreaSearchText(entry),
      localizationSearchText: localizationSearchText(entry),
    })));
  let map = null;
  let mapRenderToken = 0;
  let markerEntries = [];
  let anchorEntries = [];
  let locationOverlays = [];
  let routeOverlay = null;
  let mapListeners = [];
  let resizeObserver = null;
  let mapAuthFailureHandler = null;
  let mapSearchQuery = "";
  let searchTimer = null;
  let renderedSceneAt = null;

  function sceneMapPlace(candidate) {
    return {
      id: candidate.catalogId ?? candidate.id,
      name: candidate.title,
      location: candidate.location,
      address: candidate.address,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      imageUrl: candidate.images?.[0] ?? candidate.imageUrl ?? "./assets/card-image-fallback.png",
      placeUrl: candidate.externalLinks?.map ?? candidate.placeUrl ?? candidate.externalLinks?.official ?? candidate.source?.url ?? "#",
      type: candidate.mapType ?? (candidate.kind === "event" || candidate.group === "event" ? "event" : "other"),
      subtype: candidate.mapSubtype ?? (candidate.kind === "event" || candidate.group === "event" ? "event" : "other"),
      categories: candidate.categories ?? [candidate.category],
      collectionLabels: candidate.collectionLabels ?? [],
      localizationSearchText: candidate.localizationSearchText ?? `${candidate.title} ${candidate.location} ${candidate.address ?? ""}`,
      sourceIds: candidate.sourceIds ?? [candidate.id],
      sources: candidate.sources ?? [],
      sourceLabels: candidate.sourceLabels ?? [],
      sceneDetail: candidate,
      sceneOrder: (context.state.activeExploration?.candidates ?? []).findIndex(({ id }) => id === candidate.id) + 1,
    };
  }

  function displayedPlaces() {
    const scene = context.state.activeExploration;
    return scene?.candidates?.length ? scene.candidates.map(sceneMapPlace) : mapPlaces;
  }

  function visibleMapPlaces() {
    const query = mapSearchQuery.trim().toLowerCase();
    return displayedPlaces().filter((place) => {
      if (!mapFilterMatches(place, context.state.mapTypeFilter)) return false;
      if (!query) return true;
      return [place.name, place.location, place.address, place.areaSearchText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }

  function sourceChipLabel(source) {
    if (source === "hidden_archive") return "히든 아카이브";
    if (source === "michelin_2026") return "미쉐린";
    if (source === "agent_external") return "Agent 조사";
    if (String(source ?? "").startsWith("official_")) return "공식";
    return "출처";
  }

  function sourceBadgesMarkup(place) {
    const sources = place.sources ?? [{ source: place.source }];
    return `<span class="mohae-map-source-chips">${sources.map(({ source }) => `<i class="is-${escapeHtml(source)}">${escapeHtml(sourceChipLabel(source))}</i>`).join("")}</span>`;
  }

  function catalogDetailForPlace(place) {
    const reviews = (place.sourceIds ?? [place.id])
      .map((id) => admissionReviewBySourceId[id])
      .filter((review) => ["admitted", "candidate"].includes(review?.status) && review.explorePayload);
    return reviews.find((review) => review.status === "admitted")?.explorePayload
      ?? reviews.find((review) => review.status === "candidate")?.explorePayload
      ?? null;
  }

  function detailForPlace(place) {
    return place.sceneDetail ?? catalogDetailForPlace(place);
  }

  function selectionIdForPlace(place) {
    return detailForPlace(place)?.id ?? null;
  }

  function isPlaceSaved(place) {
    const id = selectionIdForPlace(place);
    if (!id) return false;
    return context.groupTrip?.isActive ? context.groupTrip.choiceFor(id) === "saved" : Boolean(context.state.saved[id]);
  }

  function admissionStatusForPlace(place) {
    const statuses = (place.sourceIds ?? [place.id])
      .map((id) => admissionReviewBySourceId[id]?.status)
      .filter(Boolean);
    if (statuses.includes("admitted")) return "admitted";
    if (statuses.includes("enrichment_required")) return "enrichment_required";
    return statuses[0] ?? "hold";
  }

  function externalAction(place) {
    const label = /(?:map\.naver\.com|m\.place\.naver\.com|naver\.me)\//.test(place.placeUrl) ? "네이버 지도" : "원문 보기";
    return `<a href="${escapeHtml(place.placeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>`;
  }

  function resolveCatalogCandidate({ catalogId, reason = "" }) {
    const place = mapPlaces.find((candidate) => candidate.id === catalogId || candidate.sourceIds?.includes(catalogId));
    if (!place) throw new Error(`Unknown MOHAE catalog place: ${catalogId}`);
    const detail = catalogDetailForPlace(place);
    const admissionStatus = admissionStatusForPlace(place);
    const shared = {
      catalogId: place.id,
      origin: "catalog",
      admissionStatus,
      verification: admissionStatus === "admitted" ? "admitted" : "source_lead",
      reason,
      latitude: place.latitude,
      longitude: place.longitude,
      mapType: place.type,
      mapSubtype: place.subtype,
      sourceIds: place.sourceIds,
      sources: place.sources,
      sourceLabels: place.sourceLabels,
      placeUrl: place.placeUrl,
      imageUrl: place.imageUrl,
      categories: place.categories,
      collectionLabels: place.collectionLabels,
      localizationSearchText: place.localizationSearchText,
    };
    if (detail) {
      return {
        ...detail,
        ...shared,
        subtitle: reason || detail.subtitle,
        detailHighlight: reason || detail.detailHighlight,
      };
    }
    const sourceLabel = place.sourceLabels?.join(" · ") || sourceChipLabel(place.source);
    const subtitle = reason || String(place.description ?? "").trim() || "MOHAE source에서 확인한 검토 후보";
    return {
      ...shared,
      id: `catalog:${place.id}`,
      kind: "place",
      group: "place",
      title: place.name,
      subtitle,
      detailHighlight: reason || "MOHAE source 후보 · 아직 admission 전",
      description: subtitle,
      category: MAP_TYPE_LABELS[place.type] ?? "장소",
      location: place.location,
      address: place.address || place.location,
      schedule: "확인 필요",
      price: "확인 필요",
      distance: "",
      discovery: reason,
      images: [place.imageUrl || "card-image-fallback.png"],
      photoMeta: [{ source: sourceLabel, title: "source 자료" }],
      selectionContext: { label: "MOHAE source · 검토 필요", tone: "neutral", signalType: "source_lead" },
      externalLinks: { map: place.placeUrl },
      source: { url: place.placeUrl, label: sourceLabel },
    };
  }

  function searchPlaces(input = {}) {
    const result = searchCatalogPlaces(mapPlaces, input, context.state.currentLocation);
    return {
      area: result.area,
      center: result.center,
      radiusKm: result.radiusKm,
      places: result.matches.map(({ place, distanceKm }) => ({
        catalogId: place.id,
        name: place.name,
        category: place.subtype,
        location: place.location,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)),
        admissionStatus: admissionStatusForPlace(place),
        sources: place.sources?.map(({ sourceLabel, placeUrl }) => ({ label: sourceLabel, url: placeUrl })) ?? [],
      })),
    };
  }

  function mapListMarkup(places) {
    if (!places.length) return '<div class="mohae-map-empty"><span aria-hidden="true">✦</span><h2>일치하는 장소가 없어요</h2><p>다른 장소 종류나 검색어를 확인해 주세요.</p></div>';
    const shown = places.slice(0, 80);
    const cards = shown.map((place) => `<a class="mohae-map-place" href="${escapeHtml(place.placeUrl)}" target="_blank" rel="noopener noreferrer">
      <img src="${escapeHtml(place.imageUrl)}" alt="" loading="lazy">
      <span>${sourceBadgesMarkup(place)}<strong>${escapeHtml(place.name)}</strong><em>${escapeHtml([place.location, place.categories[0]].filter(Boolean).join(" · "))}</em></span>
      ${icon("chevronRight")}
    </a>`).join("");
    const remainder = places.length - shown.length;
    return `${cards}${remainder > 0 ? `<p class="mohae-map-list-more">지도에는 전체 ${places.length.toLocaleString()}곳을 표시하고, 목록은 앞의 80곳만 보여줘요.</p>` : ""}`;
  }

  function mapPreviewMarkup(place) {
    const detail = detailForPlace(place);
    const title = detail?.title ?? place.name;
    const description = String(detail?.subtitle ?? place.description ?? "").trim();
    return `<article class="mohae-map-preview-card">
      <button class="mohae-map-preview-close" type="button" data-map-action="close-place-preview" aria-label="장소 미리보기 닫기">${icon("x")}</button>
      <img src="${escapeHtml(place.imageUrl)}" alt="${escapeHtml(title)}" loading="eager">
      <div class="mohae-map-preview-body">
        ${sourceBadgesMarkup(place)}
        <span class="mohae-map-preview-type is-${escapeHtml(place.type)}"><i></i>${escapeHtml(MAP_TYPE_LABELS[place.type])}</span>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(place.address || place.location)}</small>
        ${description ? `<p>${escapeHtml(description.length > 110 ? `${description.slice(0, 110)}…` : description)}</p>` : ""}
        ${detail ? `<dl><div><dt>운영</dt><dd>${escapeHtml(detail.schedule)}</dd></div><div><dt>비용</dt><dd>${escapeHtml(detail.price)}</dd></div></dl>` : ""}
        <div class="mohae-map-preview-actions">
          ${detail ? `<button type="button" data-map-action="save-place" data-id="${escapeHtml(detail.id)}"${isPlaceSaved(place) ? " disabled" : ""}>${isPlaceSaved(place) ? `${icon("check")} 저장됨` : `${icon("heart")} 가보고 싶어요`}</button>` : ""}
          ${detail ? `<button type="button" data-map-action="open-mohae-detail" data-id="${escapeHtml(detail.id)}">상세 보기</button>` : ""}
          ${externalAction(place)}
        </div>
      </div>
    </article>`;
  }

  function collisionCardMarkup(place) {
    const detail = detailForPlace(place);
    return `<article class="mohae-map-collision-card">
      <img src="${escapeHtml(place.imageUrl)}" alt="" loading="eager">
      <div>
        ${sourceBadgesMarkup(place)}
        <strong>${escapeHtml(detail?.title ?? place.name)}</strong>
        <small>${escapeHtml(place.address || place.location)}</small>
        <span class="mohae-map-preview-actions">
          ${detail ? `<button type="button" data-map-action="save-place" data-id="${escapeHtml(detail.id)}"${isPlaceSaved(place) ? " disabled" : ""}>${isPlaceSaved(place) ? "저장됨" : "가보고 싶어요"}</button>` : ""}
          ${detail ? `<button type="button" data-map-action="open-mohae-detail" data-id="${escapeHtml(detail.id)}">상세 보기</button>` : ""}
          ${externalAction(place)}
        </span>
      </div>
    </article>`;
  }

  function showMapPreview(place) {
    const host = context.app.querySelector(".mohae-map-popup-host");
    if (!host) return;
    host.innerHTML = mapPreviewMarkup(place);
    host.classList.add("is-visible");
  }

  function showCollisionPreview(places) {
    const host = context.app.querySelector(".mohae-map-popup-host");
    if (!host) return;
    host.innerHTML = `<section class="mohae-map-collision-list">
      <header><strong>이 위치의 장소 ${places.length}곳</strong><button class="mohae-map-preview-close" type="button" data-map-action="close-place-preview" aria-label="장소 목록 닫기">${icon("x")}</button></header>
      <div>${places.map(collisionCardMarkup).join("")}</div>
    </section>`;
    host.classList.add("is-visible");
  }

  function savePlaceFromMap(id) {
    const place = displayedPlaces().find((candidate) => selectionIdForPlace(candidate) === id);
    const detail = place ? detailForPlace(place) : null;
    if (!place || !detail || isPlaceSaved(place)) return;
    const savedAt = new Date().toISOString();
    if (context.groupTrip?.isActive) {
      void context.groupTrip.recordChoice({ placeId: id, placeTitle: detail.title, decision: "saved", surface: "map" }).catch(() => {});
    } else {
      context.state.saved[id] = {
        savedAt,
        visibleUntil: detail.kind === "place" ? addDays(savedAt, 7) : undefined,
        attendedAt: null,
        review: "",
      };
    }
    context.recordEvent("saved", id, { source: "map", sharedTrip: Boolean(context.groupTrip?.isActive) });
    context.showToast("지도 선택에 저장했어요");
    showMapPreview(place);
  }

  function closeMapPreview() {
    const host = context.app.querySelector(".mohae-map-popup-host");
    host?.classList.remove("is-visible");
    if (host) host.innerHTML = "";
  }

  function updateMapResults() {
    closeMapPreview();
    const places = visibleMapPlaces();
    const mapped = places.filter(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude));
    const summary = context.app.querySelector(".sheet-summary strong");
    const toolbar = context.app.querySelector(".mohae-map-list-toolbar");
    const list = context.app.querySelector(".mohae-map-place-list");
    if (summary) summary.textContent = `${context.state.activeExploration?.title ?? "현재 장소"} · ${places.length.toLocaleString()}곳`;
    if (toolbar) toolbar.innerHTML = `<strong>장소 ${places.length.toLocaleString()}곳</strong><span>지도 ${mapped.length.toLocaleString()} · 위치 없음 ${(places.length - mapped.length).toLocaleString()}</span>`;
    if (list) list.innerHTML = mapListMarkup(places);
    if (map && window.naver?.maps) renderMarkers(window.naver.maps, places);
  }

  function bindSearch() {
    const input = context.app.querySelector(".mohae-map-search input");
    if (!input) return;
    input.addEventListener("input", () => {
      mapSearchQuery = input.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(updateMapResults, 100);
    });
  }

  function clearMapResources() {
    clearTimeout(searchTimer);
    mapRenderToken += 1;
    markerEntries.forEach((marker) => marker.setMap(null));
    anchorEntries.forEach((marker) => marker.setMap(null));
    locationOverlays.forEach((overlay) => overlay.setMap(null));
    routeOverlay?.setMap(null);
    routeOverlay = null;
    markerEntries = [];
    anchorEntries = [];
    locationOverlays = [];
    mapListeners.forEach((listener) => window.naver?.maps?.Event.removeListener(listener));
    mapListeners = [];
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (mapAuthFailureHandler) window.removeEventListener("mohae:naver-auth-failure", mapAuthFailureHandler);
    mapAuthFailureHandler = null;
    if (typeof map?.destroy === "function") map.destroy();
    map = null;
  }

  function showMapFailure(message) {
    const status = context.app.querySelector(".mohae-map-status");
    if (!status) return;
    status.classList.remove("is-hidden");
    status.classList.add("is-error");
    status.innerHTML = `<strong>네이버 지도를 불러오지 못했어요</strong><span>${escapeHtml(message)}</span>`;
  }

  function renderMarkers(maps, places = visibleMapPlaces()) {
    markerEntries.forEach((marker) => marker.setMap(null));
    const zoom = map?.getZoom?.() ?? DEFAULT_MAP_VIEW.zoom;
    const mapped = places.filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
    const routeMode = context.state.activeExploration?.mode === "route";
    const groups = routeMode
      ? mapped.map((place) => ({ places: [place], terminalCollision: false }))
      : mapPlaceGroups(mapped, zoom);
    markerEntries = groups.map(({ places: group, terminalCollision }) => {
      const latitude = group.reduce((sum, place) => sum + place.latitude, 0) / group.length;
      const longitude = group.reduce((sum, place) => sum + place.longitude, 0) / group.length;
      const marker = new maps.Marker({
        map,
        position: new maps.LatLng(latitude, longitude),
        title: group.length === 1 ? group[0].name : `${group[0].name} 외 ${group.length - 1}곳`,
        icon: routeMode ? {
          content: routeMarkerContent(group[0].sceneOrder, group[0].name),
          size: new maps.Size(32, 32),
          anchor: new maps.Point(16, 16),
        } : {
          content: savedMarkerContent(group.length, group[0].type, terminalCollision),
          size: new maps.Size(terminalCollision ? 30 : 20, terminalCollision ? 30 : 20),
          anchor: new maps.Point(terminalCollision ? 15 : 10, terminalCollision ? 15 : 10),
        },
      });
      maps.Event.addListener(marker, "click", () => {
        if (group.length === 1) {
          showMapPreview(group[0]);
          return;
        }
        if (terminalCollision) {
          showCollisionPreview(group);
          return;
        }
        closeMapPreview();
        map.setCenter(new maps.LatLng(latitude, longitude));
        map.setZoom(Math.min(21, zoom + 2));
      });
      return marker;
    });
  }

  function renderRouteLine(maps) {
    routeOverlay?.setMap(null);
    routeOverlay = null;
    const scene = context.state.activeExploration;
    if (scene?.mode !== "route") return;
    const path = scene.candidates
      .filter(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude))
      .map(({ latitude, longitude }) => new maps.LatLng(latitude, longitude));
    if (path.length < 2) return;
    routeOverlay = new maps.Polyline({
      map,
      path,
      strokeColor: "#fd2d61",
      strokeOpacity: 0.72,
      strokeWeight: 4,
      strokeStyle: "shortdash",
    });
  }

  function renderAnchorMarkers(maps) {
    anchorEntries.forEach((marker) => marker.setMap(null));
    const anchors = context.state.activeExploration?.anchors ?? [];
    anchorEntries = anchors.map((anchor, index) => new maps.Marker({
      map,
      position: new maps.LatLng(anchor.latitude, anchor.longitude),
      title: anchor.title,
      zIndex: 900,
      icon: {
        content: `<div class="mohae-anchor-marker" aria-label="${escapeHtml(anchor.title)} 기준점"><span>${index + 1}</span></div>`,
        size: new maps.Size(30, 30),
        anchor: new maps.Point(15, 15),
      },
    }));
  }

  function frameActiveScene(maps) {
    const scene = context.state.activeExploration;
    if (!scene) return;
    const points = [...scene.anchors, ...scene.candidates]
      .filter(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude));
    if (!points.length) return;
    const latitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
    const longitude = points.reduce((sum, point) => sum + point.longitude, 0) / points.length;
    const spread = Math.max(
      Math.max(...points.map((point) => point.latitude)) - Math.min(...points.map((point) => point.latitude)),
      Math.max(...points.map((point) => point.longitude)) - Math.min(...points.map((point) => point.longitude)),
    );
    // ponytail: viewport heuristic; use LatLngBounds when route-scale framing becomes a real requirement.
    map.setZoom(spread > 0.3 ? 9 : spread > 0.1 ? 11 : 13, false);
    map.setCenter(new maps.LatLng(latitude, longitude));
  }

  async function initializeNaverMap(token) {
    await (window.__MOHAE_CONFIG_READY__ ?? Promise.resolve(window.__MOHAE_CONFIG__));
    if (token !== mapRenderToken) return;
    const clientId = window.__MOHAE_CONFIG__?.naverMapClientId?.trim();
    if (!clientId) {
      showMapFailure("로컬 지도 키가 아직 설정되지 않았어요.");
      return;
    }

    try {
      const maps = await loadNaverMaps(clientId);
      const node = context.app.querySelector("#mohaeNaverMap");
      if (!node || token !== mapRenderToken) return;
      const zoomControlOptions = { position: maps.Position.RIGHT_CENTER };
      if (maps.ZoomControlStyle?.SMALL) zoomControlOptions.style = maps.ZoomControlStyle.SMALL;
      map = new maps.Map(node, {
        center: new maps.LatLng(DEFAULT_MAP_VIEW.latitude, DEFAULT_MAP_VIEW.longitude),
        zoom: DEFAULT_MAP_VIEW.zoom,
        minZoom: 6,
        maxZoom: 21,
        draggable: true,
        pinchZoom: true,
        scrollWheel: true,
        keyboardShortcuts: true,
        disableDoubleTapZoom: false,
        disableDoubleClickZoom: false,
        zoomControl: true,
        zoomControlOptions,
        mapDataControl: false,
        scaleControl: false,
        logoControlOptions: { position: maps.Position.TOP_CENTER },
      });
      node.classList.add("is-ready");
      context.app.querySelector(".mohae-map-status")?.classList.add("is-hidden");
      renderMarkers(maps);
      renderRouteLine(maps);
      renderAnchorMarkers(maps);
      frameActiveScene(maps);
      mapListeners.push(maps.Event.addListener(map, "zoom_changed", () => renderMarkers(maps)));
    } catch (error) {
      if (token !== mapRenderToken) return;
      const message = error instanceof Error && /authentication failed/i.test(error.message)
        ? "NAVER Cloud Console에 현재 사이트 주소가 등록되어 있는지 확인해주세요."
        : "잠시 뒤 다시 시도해 주세요.";
      showMapFailure(message);
    }
  }

  function sheetGeometry() {
    const height = context.app.clientHeight || 844;
    const navHeight = 72;
    const topGap = 48;
    const sheetHeight = Math.max(240, height - navHeight - topGap);
    const visiblePartial = Math.min(sheetHeight, height * 0.46);
    return {
      sheetHeight,
      offsets: {
        full: 0,
        partial: Math.max(0, sheetHeight - visiblePartial),
        collapsed: Math.max(0, sheetHeight - 64),
      },
    };
  }

  function applySheetState(nextState, animate = true) {
    const sheet = context.app.querySelector(".mohae-map-sheet");
    if (!sheet) return;
    const safeState = ["collapsed", "partial", "full"].includes(nextState) ? nextState : "collapsed";
    const { sheetHeight, offsets } = sheetGeometry();
    sheet.style.height = `${sheetHeight}px`;
    sheet.style.setProperty("--sheet-offset", `${offsets[safeState]}px`);
    sheet.classList.toggle("is-dragging", !animate);
    sheet.dataset.sheetState = safeState;
    if (safeState !== "collapsed") closeMapPreview();
    const handle = sheet.querySelector(".mohae-sheet-handle");
    handle?.setAttribute("aria-expanded", safeState === "collapsed" ? "false" : "true");
    handle?.setAttribute("aria-label", safeState === "collapsed" ? "장소 목록 일부 열기" : safeState === "partial" ? "장소 목록 전체 열기" : "장소 목록 접기");
    const caret = handle?.querySelector(".sheet-caret");
    caret?.classList.toggle("is-down", safeState === "full");
    context.state.mapSheetState = safeState;
    context.saveState();
  }

  function cycleSheetState() {
    const current = context.state.mapSheetState;
    applySheetState(current === "collapsed" ? "partial" : current === "partial" ? "full" : "collapsed");
  }

  function bindSheet() {
    const sheet = context.app.querySelector(".mohae-map-sheet");
    const handle = sheet?.querySelector(".mohae-sheet-handle");
    if (!sheet || !handle) return;
    applySheetState(context.state.mapSheetState, false);
    requestAnimationFrame(() => sheet.classList.remove("is-dragging"));

    let pointerId = null;
    let startY = 0;
    let startOffset = 0;
    let currentOffset = 0;
    let startedAt = 0;
    let moved = false;

    handle.addEventListener("pointerdown", (event) => {
      pointerId = event.pointerId;
      startY = event.clientY;
      startOffset = Number.parseFloat(getComputedStyle(sheet).getPropertyValue("--sheet-offset")) || 0;
      currentOffset = startOffset;
      startedAt = performance.now();
      moved = false;
      sheet.classList.add("is-dragging");
      handle.setPointerCapture(pointerId);
    });

    handle.addEventListener("pointermove", (event) => {
      if (event.pointerId !== pointerId) return;
      const { offsets } = sheetGeometry();
      const movement = event.clientY - startY;
      if (Math.abs(movement) > 5) moved = true;
      currentOffset = Math.min(offsets.collapsed, Math.max(offsets.full, startOffset + movement));
      sheet.style.setProperty("--sheet-offset", `${currentOffset}px`);
    });

    const release = (event, cancelled = false) => {
      if (event.pointerId !== pointerId) return;
      const movement = event.clientY - startY;
      const elapsed = Math.max(1, performance.now() - startedAt);
      const velocity = movement / elapsed;
      const { offsets } = sheetGeometry();
      pointerId = null;
      if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId);

      if (cancelled) {
        applySheetState(context.state.mapSheetState);
        return;
      }
      if (!moved) {
        cycleSheetState();
        return;
      }

      const states = ["full", "partial", "collapsed"];
      let nearest = states.reduce((best, state) => (
        Math.abs(currentOffset - offsets[state]) < Math.abs(currentOffset - offsets[best]) ? state : best
      ), "full");
      if (Math.abs(velocity) > 0.45) {
        const index = states.indexOf(nearest);
        nearest = velocity < 0 ? states[Math.max(0, index - 1)] : states[Math.min(states.length - 1, index + 1)];
      }
      applySheetState(nearest);
    };

    handle.addEventListener("pointerup", (event) => release(event));
    handle.addEventListener("pointercancel", (event) => release(event, true));
    handle.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const current = ["full", "partial", "collapsed"].indexOf(context.state.mapSheetState);
        applySheetState(["full", "partial", "collapsed"][Math.max(0, current - 1)]);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const current = ["full", "partial", "collapsed"].indexOf(context.state.mapSheetState);
        applySheetState(["full", "partial", "collapsed"][Math.min(2, current + 1)]);
      }
    });

    resizeObserver = new ResizeObserver(() => {
      applySheetState(context.state.mapSheetState, false);
      requestAnimationFrame(() => sheet.classList.remove("is-dragging"));
    });
    resizeObserver.observe(context.app);
  }

  function updateFilters(value) {
    context.state.mapTypeFilter = context.state.mapTypeFilter === value ? null : value;
    context.saveState();
    render();
  }

  function findMe() {
    if (!navigator.geolocation || !map || !window.naver?.maps) {
      context.showToast("현재 위치를 아직 사용할 수 없어요");
      return;
    }
    const button = context.app.querySelector('[data-map-action="find-me"]');
    button?.setAttribute("aria-busy", "true");
    button?.setAttribute("disabled", "");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const maps = window.naver.maps;
      locationOverlays.forEach((overlay) => overlay.setMap(null));
      const center = new maps.LatLng(coords.latitude, coords.longitude);
      const circle = new maps.Circle({
        map,
        center,
        radius: Math.max(coords.accuracy || 0, 18),
        strokeColor: "#2e77ed",
        strokeOpacity: 0.35,
        strokeWeight: 1,
        fillColor: "#2e77ed",
        fillOpacity: 0.12,
        clickable: false,
      });
      const marker = new maps.Marker({
        map,
        position: center,
        title: "내 위치",
        zIndex: 1000,
        icon: {
          content: '<div class="current-location-marker" aria-label="내 위치"></div>',
          anchor: new maps.Point(11, 11),
        },
      });
      locationOverlays = [circle, marker];
      context.state.currentLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        updatedAt: new Date().toISOString(),
      };
      context.saveState();
      map.setZoom(14, false);
      map.setCenter(center);
      button?.removeAttribute("aria-busy");
      button?.removeAttribute("disabled");
    }, () => {
      button?.removeAttribute("aria-busy");
      button?.removeAttribute("disabled");
      context.showToast("위치 권한을 확인해 주세요");
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  }

  function render() {
    clearMapResources();
    context.bottomNav.classList.remove("is-hidden");
    context.state.activeTab = "map";
    const scene = context.state.activeExploration;
    if ((scene?.createdAt ?? null) !== renderedSceneAt) {
      mapSearchQuery = "";
      context.state.mapTypeFilter = null;
      renderedSceneAt = scene?.createdAt ?? null;
    }
    const typeFilter = context.state.mapTypeFilter ?? null;
    const places = visibleMapPlaces();
    const mappedCount = places.filter(({ latitude, longitude }) => Number.isFinite(latitude) && Number.isFinite(longitude)).length;
    context.app.innerHTML = `<section class="screen mohae-map-screen" data-view="map">
      <div id="mohaeNaverMap" class="mohae-naver-map" role="region" aria-label="${escapeHtml(scene?.title ?? "MOHAE 장소")} 지도"></div>
      <div class="mohae-map-status" role="status"><strong>네이버 지도 불러오는 중</strong><span>MOHAE 지도를 준비하고 있어요.</span></div>
      <div class="mohae-map-popup-host" aria-live="polite"></div>

      <div class="mohae-map-tools mohae-map-tools-left">
        <button type="button" data-map-action="find-me">${icon("focus")}<span>내 위치</span></button>
      </div>
      <div class="mohae-map-tools mohae-map-tools-right">
        ${context.groupTrip?.headerButtonMarkup() ?? ""}
        <button class="round-button" type="button" data-map-action="notification" aria-label="알림">${icon("bell")}</button>
      </div>

      <aside class="mohae-map-sheet is-dragging" data-sheet-state="${escapeHtml(context.state.mapSheetState)}" aria-label="MOHAE 장소 목록">
        <button class="mohae-sheet-handle" type="button" aria-expanded="false">
          <span class="sheet-grabber" aria-hidden="true"></span>
          <span class="sheet-summary"><strong>${escapeHtml(scene?.title ?? "현재 장소")} · ${places.length.toLocaleString()}곳</strong><small>위로 밀어 장소 보기</small></span>
          ${icon("chevronUp", "sheet-caret")}
        </button>
        <div class="mohae-sheet-content">
          <header class="mohae-map-brand"><span class="mark">✦</span><span><b>MOHAE</b><small>${scene ? "Agent exploration" : "Places"}</small></span></header>
          ${context.groupTrip?.bannerMarkup() ?? ""}
          ${scene ? `<section class="mohae-agent-scene"><span><small>현재 탐색</small><strong>${escapeHtml(scene.title)}</strong>${scene.contextLabel ? `<em>${escapeHtml(scene.contextLabel)}</em>` : ""}</span><button type="button" data-map-action="clear-exploration">전체 지도</button></section>` : ""}
          <label class="mohae-map-search">${icon("search")}<input type="search" value="${escapeHtml(mapSearchQuery)}" placeholder="장소·지역 검색" aria-label="현재 장소 검색"></label>
          <section class="mohae-map-filter-section is-single-row" aria-label="장소 종류">
            <div class="mohae-map-chips">${filterButtons(MAP_TYPE_FILTER_GROUPS, "type", typeFilter)}</div>
          </section>
          <div class="mohae-map-list-toolbar"><strong>장소 ${places.length.toLocaleString()}곳</strong><span>지도 ${mappedCount.toLocaleString()} · 위치 없음 ${(places.length - mappedCount).toLocaleString()}</span></div>
          <div class="mohae-map-place-list">${mapListMarkup(places)}</div>
        </div>
      </aside>
    </section>`;
    mapAuthFailureHandler = () => showMapFailure("NAVER Cloud Console에 현재 사이트 주소가 등록되어 있는지 확인해주세요.");
    window.addEventListener("mohae:naver-auth-failure", mapAuthFailureHandler);
    context.syncNavigation();
    bindSheet();
    bindSearch();
    const token = mapRenderToken;
    initializeNaverMap(token);
  }

  function handleAction(button) {
    const action = button.dataset.mapAction;
    if (button.dataset.mapFilterGroup) {
      updateFilters(button.dataset.value);
      return true;
    }
    if (action === "find-me") findMe();
    else if (action === "notification") context.showToast("알림은 아직 연결되지 않았어요");
    else if (action === "close-place-preview") closeMapPreview();
    else if (action === "save-place") savePlaceFromMap(button.dataset.id);
    else if (action === "open-mohae-detail") {
      context.state.activeTab = "explore";
      context.state.view = "detail";
      context.state.detailId = button.dataset.id;
      context.saveState();
      context.render();
    } else if (action === "clear-exploration") {
      context.state.activeExploration = null;
      context.state.mapTypeFilter = null;
      context.recordEvent("agent_exploration_cleared");
      render();
    } else return false;
    return true;
  }

  return { deactivate: clearMapResources, handleAction, render, resolveCatalogCandidate, searchPlaces };
}
