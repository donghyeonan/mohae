import { addDays, escapeHtml, icon } from "./core.js";
import { detailReturnGesture } from "./gestures.js";
import { mountNaverMapPreview } from "./map.js";
import { opportunities } from "./sample-data.js";
import { admissionReviewBySourceId, refreshSourceCatalog, sourceIndexEntries } from "./data.js";

const SOURCE_BATCH_SIZE = 20;

let sourceOpportunities = [];
let allOpportunities = [];
let sourceOpportunityIds = new Set();

function rebuildOpportunityPool() {
  sourceOpportunities = sourceIndexEntries.flatMap((entry) => {
    const review = admissionReviewBySourceId[entry.id];
    if (!["admitted", "candidate"].includes(review?.status) || !review.explorePayload?.id) return [];
    return [{ ...review.explorePayload, admissionStatus: review.status, sourceIndexId: entry.id }];
  });
  allOpportunities = [...new Map([...opportunities, ...sourceOpportunities].map((item) => [item.id, item])).values()];
  sourceOpportunityIds = new Set(sourceOpportunities.map(({ id }) => id));
}

rebuildOpportunityPool();

export function createExploreFeature(context) {
  const { app, bottomNav } = context;
  let filterReturnFocus = null;
  let animateDetailEntry = false;
  let animateExploreReturn = false;
  let deckTransitionLocked = false;
  let detailTransitionLocked = false;
  let detailMapCleanup = null;
  let detailMapToken = 0;

  function clearDetailLocationMap() {
    detailMapToken += 1;
    detailMapCleanup?.();
    detailMapCleanup = null;
  }

  async function initializeDetailLocationMap(item) {
    const token = ++detailMapToken;
    const node = app.querySelector("#detailLocationMap");
    const status = app.querySelector(".detail-location-status");
    if (!node) return;
    try {
      const cleanup = await mountNaverMapPreview(node, {
        latitude: item.latitude,
        longitude: item.longitude,
        title: item.title,
      });
      if (token !== detailMapToken) {
        cleanup();
        return;
      }
      detailMapCleanup = cleanup;
      status?.classList.add("is-hidden");
    } catch {
      if (token !== detailMapToken) return;
      status?.classList.add("is-error");
      if (status) status.textContent = "지도를 불러오지 못했어요";
    }
  }

  function getOpportunity(id) {
    return context.state.activeExploration?.candidates?.find((item) => item.id === id)
      ?? allOpportunities.find((item) => item.id === id)
      ?? null;
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function loadNextSourceBatch() {
    const seen = new Set(context.state.exploreSeenIds);
    const unseen = sourceOpportunities.filter((item) => !context.state.saved[item.id] && !seen.has(item.id));
    if (!unseen.length) return false;
    context.state.exploreBatchIds = shuffle(unseen).slice(0, SOURCE_BATCH_SIZE).map(({ id }) => id);
    context.state.exploreSeenIds = [...new Set([...context.state.exploreSeenIds, ...context.state.exploreBatchIds])];
    context.state.exploreBatchIds.forEach((id) => delete context.state.decisions[id]);
    context.state.activeExploration = null;
    context.state.activeCollectionId = null;
    context.saveState();
    return true;
  }

  async function refreshAndLoadNextSourceBatch() {
    if (deckTransitionLocked) return;
    deckTransitionLocked = true;
    const button = app.querySelector('[data-action="next-source-batch"]');
    if (button) button.disabled = true;
    try {
      let source = "loaded_catalog";
      if (!loadNextSourceBatch()) {
        await refreshSourceCatalog();
        rebuildOpportunityPool();
        source = "supabase_refresh";
        if (!loadNextSourceBatch()) {
          context.showToast("새로운 추천 장소가 아직 없어요");
          return;
        }
      }
      context.recordEvent("source_batch_loaded", null, { size: context.state.exploreBatchIds.length, source });
      renderExplore();
    } catch {
      context.showToast("새 추천을 확인하지 못했어요");
    } finally {
      deckTransitionLocked = false;
      if (button?.isConnected) button.disabled = false;
    }
  }

  function sourceBatch() {
    if (!context.state.exploreBatchIds.length || context.state.exploreBatchIds.some((id) => !sourceOpportunityIds.has(id))) {
      context.state.exploreBatchIds = [];
      loadNextSourceBatch();
    }
    const seen = new Set(context.state.exploreSeenIds);
    let changed = false;
    context.state.exploreBatchIds.forEach((id) => {
      if (!seen.has(id)) { seen.add(id); changed = true; }
    });
    if (changed) {
      context.state.exploreSeenIds = [...seen];
      context.saveState();
    }
    return context.state.exploreBatchIds.map(getOpportunity).filter(Boolean);
  }

  function availableOpportunities() {
    const scene = context.state.activeExploration;
    if (scene?.candidates?.length) {
      return scene.candidates.filter((item) => !isPassed(item.id) && !isSaved(item.id));
    }
    return sourceBatch().filter((item) => {
      const matchesFilter = context.state.filter === "all" || item.group === context.state.filter;
      const matchesCollection = !context.state.activeCollectionId || item.collectionContext?.id === context.state.activeCollectionId;
      const available = !isPassed(item.id) && !isSaved(item.id);
      return matchesFilter && matchesCollection && available;
    });
  }

  function visibleDeck() {
    return availableOpportunities();
  }

  function currentOpportunity() {
    return visibleDeck()[0] ?? null;
  }

  function sharedChoice(id) {
    return context.groupTrip?.isActive ? context.groupTrip.choiceFor(id) : null;
  }

  function isPassed(id) {
    return context.groupTrip?.isActive ? sharedChoice(id) === "passed" : context.state.decisions[id] === "passed";
  }

  function isSaved(id) {
    return context.groupTrip?.isActive ? sharedChoice(id) === "saved" : Boolean(context.state.saved[id]);
  }

  function locationLine(item) {
    const distance = item.distance;
    return distance ? `${item.location} · ${distance}` : item.location;
  }

  function imageSrc(src) {
    if (/^https:\/\/blogfiles\.pstatic\.net\//.test(src)) {
      return `https://search.pstatic.net/common/?autoRotate=true&quality=95&type=f750_750&src=${encodeURIComponent(src)}`;
    }
    return /^(https?:|data:|blob:|\/)/.test(src) ? src : `./assets/${src}`;
  }

  function bindImageFallbacks() {
    app.querySelectorAll("img[data-card-image]").forEach((image) => {
      const useFallback = () => {
        if (image.dataset.fallbackApplied === "true") return;
        image.dataset.fallbackApplied = "true";
        image.classList.add("is-fallback");
        image.src = "./assets/card-image-fallback.png";
      };
      image.addEventListener("error", useFallback, { once: true });
      if (image.complete && image.naturalWidth === 0) useFallback();
    });
  }

  function collectionChipMarkup(item) {
    const collection = item.collectionContext;
    if (!collection) return "";
    const external = collection.targetType === "external_source";
    const action = external ? "open-source-collection" : "open-mohae-collection";
    const tone = external ? "is-external-source" : "is-mohae-collection";
    const destination = external ? "원문 목록 열기" : "컬렉션만 보기";
    const displayLabel = external ? collection.label : "MOHAE";
    const url = external ? ` data-url="${escapeHtml(collection.url)}"` : "";
    const leadingIcon = external ? icon("archive") : "";
    return `<button class="card-collection-chip ${tone}" type="button" data-action="${action}" data-id="${item.id}" data-collection-id="${escapeHtml(collection.id)}"${url} aria-label="${escapeHtml(collection.label)} ${destination}">${leadingIcon}<span>${escapeHtml(displayLabel)}</span>${external ? '<b aria-hidden="true">↗</b>' : ""}</button>`;
  }

  function selectionChipMarkup(item) {
    if (!item.selectionContext?.label) return "";
    const label = item.selectionContext.label;
    const tone = ["institution", "media", "editorial", "heritage", "global", "neutral"].includes(item.selectionContext.tone)
      ? item.selectionContext.tone
      : "neutral";
    const isMichelin = item.collectionContext?.id === "michelin-guide-korea-2026";
    const signalType = item.selectionContext.signalType;
    const starCount = isMichelin && signalType === "michelin_star" ? item.selectionContext.numericValue : 0;
    const starMark = '<img class="michelin-mark is-star" src="./assets/michelin-star.svg" alt="">';
    const michelinMark = starCount
      ? `<span class="michelin-star-marks" aria-hidden="true">${starMark.repeat(starCount)}</span>`
      : isMichelin && signalType === "michelin_bib_gourmand"
        ? '<img class="michelin-mark is-bib" src="./assets/michelin-bib-gourmand.svg" alt="" aria-hidden="true">'
        : "";
    const leadingIcon = michelinMark || (!isMichelin && item.selectionContext.icon ? icon(item.selectionContext.icon) : "");
    return `<span class="card-selection-chip is-${tone}">${leadingIcon}<span>${escapeHtml(label)}</span></span>`;
  }

  function cardChipRow(item) {
    const chips = `${collectionChipMarkup(item)}${selectionChipMarkup(item)}`;
    return chips ? `<div class="card-chip-row">${chips}</div>` : "";
  }

  function eventMetaMarkup(item) {
    if (item.kind !== "event") return "";
    const compactSchedule = String(item.schedule ?? "").split(" · ")[0];
    return `<span class="card-event-meta">${icon("calendar")}<b>${escapeHtml(compactSchedule)}</b><i aria-hidden="true">·</i>${icon("map")}<b>${escapeHtml(item.location)}</b></span>`;
  }

  function photoIndex(item) {
    return Math.min(context.state.photoIndices[item.id] ?? 0, item.images.length - 1);
  }

  function photoProgress(item) {
    const current = photoIndex(item);
    return `<div class="photo-progress" aria-hidden="true">${item.images
      .map((_, index) => `<i class="${index === current ? "is-current" : index < current ? "is-seen" : ""}"></i>`)
      .join("")}</div>`;
  }

  function cardMarkup(item, behind = false) {
    const index = photoIndex(item);
    const routeOrder = context.state.activeExploration?.mode === "route"
      ? context.state.activeExploration.candidates.findIndex(({ id }) => id === item.id) + 1
      : 0;
    return `<article class="opportunity-card${behind ? " is-behind" : ""}" data-card-id="${item.id}" aria-label="${escapeHtml(item.title)}">
      <img data-card-image src="${escapeHtml(imageSrc(item.images[index]))}" alt="${escapeHtml(item.title)} 사진 ${index + 1}">
      ${photoProgress(item)}
      ${routeOrder && !behind ? `<span class="card-route-order"><b>${routeOrder}</b>번째 일정</span>` : ""}
      ${behind ? "" : `<span class="card-photo-count">${index + 1}/${item.images.length}</span>
      ${item.images.length > 1 ? `<button class="photo-cycle" type="button" data-action="next-photo" aria-label="${escapeHtml(item.title)} 다음 사진"></button>` : ""}
      <div class="card-information">
        <span class="category-kicker">${escapeHtml(item.category)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <span class="card-subtitle">${escapeHtml(item.subtitle)}</span>
        ${eventMetaMarkup(item)}
        ${cardChipRow(item)}
        <span class="detail-hint">↓ 스크롤해 자세히</span>
      </div>`}
    </article>`;
  }

  function topbar() {
    return `<header class="topbar">
      <div class="wordmark"><span class="mark">✦</span><span>MOHAE</span></div>
      <div class="topbar-actions">
        ${context.groupTrip?.headerButtonMarkup() ?? ""}
        <button class="square-button" type="button" data-action="open-profile" aria-label="내 프로필">${icon("user")}</button>
        <button class="square-button" type="button" data-action="open-filter" aria-label="추천 유형 필터">${icon("filter")}</button>
      </div>
    </header>`;
  }

  function renderExplore() {
    clearDetailLocationMap();
    const items = visibleDeck();
    const item = items[0];
    const next = items[1];
    const scene = context.state.activeExploration;
    const activeCollection = scene ? null : collectionFor(context.state.activeCollectionId);
    const admittedAvailable = sourceOpportunities.filter((candidate) => !context.state.saved[candidate.id]).length;
    const seenIds = new Set(context.state.exploreSeenIds);
    const unseenAdmitted = sourceOpportunities.filter((candidate) => !context.state.saved[candidate.id] && !seenIds.has(candidate.id)).length;
    const hasAnotherBatch = unseenAdmitted > 0;
    const summaryLabel = scene
      ? scene.title
      : activeCollection
        ? `컬렉션 · ${activeCollection.label}`
        : context.state.filter === "all"
          ? `추천 장소 · ${admittedAvailable}곳`
          : context.state.filter === "event" ? "현재 프로그램" : "장소";
    const emptyAction = scene ? "clear-exploration" : activeCollection ? "clear-collection" : "next-source-batch";
    const emptyActionLabel = scene || activeCollection ? "전체 추천 보기" : hasAnotherBatch ? `다음 ${Math.min(SOURCE_BATCH_SIZE, unseenAdmitted)}곳 보기` : "새 추천 확인";
    bottomNav.classList.remove("is-hidden");
    app.innerHTML = `<section class="screen explore-screen${animateExploreReturn ? " is-returning" : ""}${context.groupTrip?.isActive ? " has-group-room" : ""}" data-view="explore">
      ${topbar()}
      ${context.groupTrip?.bannerMarkup() ?? ""}
      <div class="filter-summary">
        <span>${escapeHtml(summaryLabel)}</span>
        ${scene ? `<button type="button" data-action="clear-exploration">전체 추천</button>` : activeCollection ? `<button type="button" data-action="clear-collection">컬렉션 닫기</button>` : `<b>${items.length}/${context.state.exploreBatchIds.length || Math.min(SOURCE_BATCH_SIZE, admittedAvailable)} 남음</b>`}
      </div>
      <div class="deck" aria-live="polite">
        ${next ? cardMarkup(next, true) : ""}
        ${item ? cardMarkup(item) : `<div class="deck-empty"><span>✦</span><h2>지금 추천을 모두 봤어요</h2><p>${scene ? "Agent가 구성한 후보를 모두 확인했어요." : activeCollection ? "이 컬렉션의 카드를 모두 확인했어요." : hasAnotherBatch ? "아직 보지 않은 추천 장소가 있어요." : "버튼을 누르면 새 추천을 확인해요."}</p><button type="button" data-action="${emptyAction}">${emptyActionLabel}</button></div>`}
      </div>
      ${item ? `<div class="deck-actions" aria-label="추천 선택">
        <button class="action-button pass-button" type="button" data-action="pass" aria-label="넘기기">${icon("x")}</button>
        <button class="action-button save-button" type="button" data-action="save" aria-label="저장하기">${icon("heart")}</button>
      </div>` : ""}
      <p class="gesture-note">← 넘기기 · → 저장 · ↓ 자세히 · 카드 클릭으로 사진 전환</p>
    </section>`;
    bindImageFallbacks();
    if (item) {
      const exposureKey = scene ? `${scene.createdAt}:${item.id}` : `seoul-gyeonggi-w35:${item.id}`;
      if (!context.state.exposed[exposureKey]) {
        context.state.exposed[exposureKey] = new Date().toISOString();
        context.recordEvent("exposed", item.id, { rank: 1, sceneTitle: scene?.title ?? null });
      }
      bindCardGesture();
    }
    context.syncNavigation();
    animateExploreReturn = false;
  }

  function reviewBody(value, limit = 280) {
    const text = String(value ?? "").trim();
    return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
  }

  function renderPrograms(item) {
    if (!item.programs?.length) return "";
    return `<section class="evidence-section">
      <div class="evidence-heading"><h2>현재 전시·공연·프로그램</h2></div>
      <div class="program-list">${item.programs.map((program) => `<a class="program-card" href="${escapeHtml(program.url)}" target="_blank" rel="noopener noreferrer">
        <strong>${escapeHtml(program.title)}</strong><span>${escapeHtml(program.period)}</span><small>${escapeHtml(program.price)}</small>
      </a>`).join("")}</div>
    </section>`;
  }

  function renderMenu(item) {
    if (!item.menu?.length && !item.menuMedia?.length) return "";
    return `<section class="evidence-section menu-evidence">
      <div class="evidence-heading"><h2>메뉴</h2></div>
      ${item.menuMedia?.length ? `<div class="menu-media" aria-label="메뉴 사진">${item.menuMedia.map((media) => `<figure><img data-card-image src="${escapeHtml(imageSrc(media.src))}" alt="${escapeHtml(item.title)} ${escapeHtml(media.title)}" loading="lazy"><figcaption>${escapeHtml(media.title)}</figcaption></figure>`).join("")}</div>` : ""}
      ${item.menu?.length ? `<div class="menu-list">${item.menu.slice(0, 8).map((menu) => `<div><span><b>${escapeHtml(menu.name)}</b>${menu.description ? `<small>${escapeHtml(reviewBody(menu.description, 92))}</small>` : ""}</span><strong>${escapeHtml(menu.price)}</strong></div>`).join("")}</div>` : ""}
      <p class="menu-more-note">대표 메뉴만 표시했어요. 전체 메뉴와 최신 가격은 아래 네이버 지도에서 확인하세요.</p>
    </section>`;
  }

  function renderExternalProvenance(item) {
    if (item.origin !== "external" || !item.source?.url) return "";
    const observedAt = item.source.observedAt
      ? new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(item.source.observedAt))
      : "확인 시각 없음";
    return `<section class="evidence-section agent-provenance">
      <div class="evidence-heading"><h2>Agent 조사 출처</h2></div>
      <p>MOHAE catalog에 승격되지 않은 외부 후보예요. 출처를 확인한 뒤 판단하세요.</p>
      <a href="${escapeHtml(item.source.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(item.source.label ?? "외부 출처")}</strong><span>${escapeHtml(observedAt)} 확인</span>${icon("externalLink")}</a>
    </section>`;
  }

  function detailExternalAction(item) {
    const links = item.externalLinks ?? {};
    const naverMapUrl = [links.map, item.mapUrl, item.placeUrl]
      .find((url) => /(?:map\.naver\.com|m\.place\.naver\.com|naver\.me)\//.test(url ?? ""));
    if (naverMapUrl) return { url: naverMapUrl, label: "네이버 지도", iconName: "map", isNaverMap: true };
    const url = links.official ?? item.official?.sourceUrl ?? item.source?.url;
    return url ? { url, label: links.officialLabel ?? "공식 홈페이지", iconName: "externalLink", isNaverMap: false } : null;
  }

  function renderLocationMap(item) {
    const hasCoordinates = Number.isFinite(item.latitude) && Number.isFinite(item.longitude);
    if (!hasCoordinates) return "";
    return `<section class="evidence-section detail-location-section">
      <div class="detail-location-heading"><span><small>위치</small><strong>${escapeHtml(item.location)}</strong></span></div>
      <div class="detail-location-map-wrap">
        <div id="detailLocationMap" class="detail-location-map" role="region" aria-label="${escapeHtml(item.title)} 위치 지도"></div>
        <div class="detail-location-status" role="status">네이버 지도를 불러오는 중</div>
      </div>
      <p class="detail-location-address">${icon("map")}<span>${escapeHtml(item.address ?? item.location)}</span></p>
    </section>`;
  }

  function renderDetail(id) {
    clearDetailLocationMap();
    const item = getOpportunity(id);
    if (!item) {
      context.state.view = "explore";
      renderExplore();
      return;
    }
    const index = photoIndex(item);
    const photo = item.photoMeta?.[index];
    const externalAction = detailExternalAction(item);
    bottomNav.classList.add("is-hidden");
    app.innerHTML = `<section class="screen detail-screen${animateDetailEntry ? " is-entering" : ""}" data-view="detail">
      <header class="detail-topbar">
        <button class="detail-back-button" type="button" data-action="back-explore" aria-label="탐색으로 돌아가기">${icon("arrowLeft")}<span>탐색</span></button>
        <div class="wordmark compact"><span class="mark">✦</span><span>MOHAE</span></div>
        <span class="detail-topbar-spacer" aria-hidden="true"></span>
      </header>
      <div class="detail-scroll">
        <figure class="detail-hero">
          <img data-card-image src="${escapeHtml(imageSrc(item.images[index]))}" alt="${escapeHtml(item.title)} 사진 ${index + 1}">
          ${photoProgress(item)}
          <div class="detail-photo-caption"><span>${index + 1}/${item.images.length}</span><b>${escapeHtml(photo?.source ?? "출처 확인")}${photo?.title ? ` · ${escapeHtml(photo.title)}` : ""}</b></div>
          ${item.images.length > 1 ? `<button class="photo-cycle" type="button" data-action="next-photo" data-id="${item.id}" aria-label="다음 사진"></button>` : ""}
        </figure>
        <div class="detail-body">
          <div class="detail-highlight">${escapeHtml(item.detailHighlight)}</div>
          <span class="category-kicker accent">${escapeHtml(item.category)}</span>
          <h1>${escapeHtml(item.title)}</h1>
          <p class="detail-subtitle">${escapeHtml(item.subtitle)}</p>
          <div class="fact-grid">
            <div>${icon("map")}<span><small>위치</small><b>${escapeHtml(item.address ?? locationLine(item))}</b></span></div>
            <div>${icon("calendar")}<span><small>운영</small><b>${escapeHtml(item.schedule)}</b></span></div>
            <div>${icon("wallet")}<span><small>비용</small><b>${escapeHtml(item.price)}</b></span></div>
          </div>
          ${renderPrograms(item)}
          ${renderLocationMap(item)}
          ${renderExternalProvenance(item)}
          ${renderMenu(item)}
          <div class="detail-cta-row">
            ${externalAction ? `<a class="secondary-cta${externalAction.isNaverMap ? " is-naver-map" : ""}" href="${escapeHtml(externalAction.url)}" target="_blank" rel="noopener noreferrer">${icon(externalAction.iconName)} ${escapeHtml(externalAction.label)}</a>` : ""}
            <button class="primary-cta" type="button" data-action="save-detail" data-id="${item.id}">${isSaved(item.id) ? `${icon("check")} 저장됨` : `${icon("heart")} 저장하기`}</button>
          </div>
        </div>
      </div>
    </section>`;
    bindImageFallbacks();
    bindDetailBackGesture();
    initializeDetailLocationMap(item);
    animateDetailEntry = false;
  }

  function bindDetailBackGesture() {
    const screen = app.querySelector(".detail-screen");
    const scroller = screen?.querySelector(".detail-scroll");
    if (!screen || !scroller) return;
    let startX = 0;
    let startY = 0;
    let pointerId = null;
    let pointerStartedAtTop = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartedAtTop = false;
    let returning = false;
    let wheelDistance = 0;
    let wheelResetTimer;
    const returnOnce = (smooth) => {
      if (returning) return;
      returning = true;
      backToExplore(smooth);
    };
    screen.addEventListener("pointerdown", (event) => {
      pointerId = event.pointerId;
      pointerStartedAtTop = scroller.scrollTop <= 1;
      startX = event.clientX;
      startY = event.clientY;
    });
    screen.addEventListener("pointerup", (event) => {
      if (pointerId !== event.pointerId) return;
      const gesture = detailReturnGesture({ startX, startY, endX: event.clientX, endY: event.clientY, scrollTop: pointerStartedAtTop ? scroller.scrollTop : Number.POSITIVE_INFINITY });
      pointerId = null;
      if (gesture) {
        event.preventDefault();
        returnOnce(gesture === "vertical");
      }
    });
    screen.addEventListener("pointercancel", () => { pointerId = null; });
    screen.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartedAtTop = scroller.scrollTop <= 1;
    }, { passive: true });
    screen.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      if (!touch || !touchStartedAtTop) return;
      const gesture = detailReturnGesture({ startX: touchStartX, startY: touchStartY, endX: touch.clientX, endY: touch.clientY, scrollTop: scroller.scrollTop });
      if (gesture) returnOnce(gesture === "vertical");
    }, { passive: true });
    screen.addEventListener("touchcancel", () => { touchStartedAtTop = false; }, { passive: true });
    scroller.addEventListener("wheel", (event) => {
      if (returning || event.deltaY >= 0 || scroller.scrollTop > 1) {
        if (event.deltaY >= 0 || scroller.scrollTop > 1) wheelDistance = 0;
        return;
      }
      event.preventDefault();
      wheelDistance += Math.abs(event.deltaY);
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => { wheelDistance = 0; }, 180);
      if (wheelDistance < 54) return;
      returnOnce(true);
    }, { passive: false });
  }

  function collectionFor(id) {
    if (!id) return null;
    const items = allOpportunities.filter((item) => item.collectionContext?.id === id);
    if (!items.length) return null;
    return { id, label: items[0].collectionContext.label, items };
  }

  function renderFilter() {
    if (document.querySelector(".sheet-overlay")) return;
    filterReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overlay = document.createElement("div");
    overlay.className = "sheet-overlay";
    overlay.innerHTML = `<div class="filter-sheet" role="dialog" aria-modal="true" aria-labelledby="filter-title" tabindex="-1">
      <div class="sheet-handle"></div><h2 id="filter-title">이번에는 무엇을 볼까요?</h2><p>검색하지 않고, 준비된 추천 안에서만 고릅니다.</p>
      <div class="filter-options">
        <button type="button" data-action="set-filter" data-filter="all" aria-pressed="${context.state.filter === "all"}"><span>✦</span><b>전체 경험</b><small>종류를 섞어서 보기</small>${icon("check")}</button>
        <button type="button" data-action="set-filter" data-filter="event" aria-pressed="${context.state.filter === "event"}"><span>◌</span><b>현재 프로그램</b><small>공연 · 전시 · 예약형 야외 경험</small>${icon("check")}</button>
        <button type="button" data-action="set-filter" data-filter="place" aria-pressed="${context.state.filter === "place"}"><span>⌂</span><b>장소</b><small>음식 · 카페 · 공원 · 웰니스</small>${icon("check")}</button>
      </div>
      <button class="sheet-close" type="button" data-action="close-sheet">닫기</button>
    </div>`;
    document.querySelector(".phone").append(overlay);
    const sheet = overlay.querySelector(".filter-sheet");
    sheet.focus();
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSheet();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = [...sheet.querySelectorAll("button")];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === sheet)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function closeSheet() {
    document.querySelector(".sheet-overlay")?.remove();
    if (filterReturnFocus?.isConnected) filterReturnFocus.focus();
    filterReturnFocus = null;
  }

  function render() {
    if (context.state.view === "detail") renderDetail(context.state.detailId);
    else renderExplore();
  }

  function movePhoto(item, direction) {
    const current = photoIndex(item);
    context.state.photoIndices[item.id] = (current + direction + item.images.length) % item.images.length;
    context.saveState();
    render();
  }

  function runSharedViewTransition(update) {
    if (detailTransitionLocked) return true;
    if (typeof document.startViewTransition !== "function" || matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    detailTransitionLocked = true;
    document.documentElement.classList.add("is-detail-transition");
    const transition = document.startViewTransition(update);
    transition.finished.finally(() => {
      detailTransitionLocked = false;
      document.documentElement.classList.remove("is-detail-transition");
    }).catch(() => {});
    return true;
  }

  function openDetail(item, smooth = true) {
    if (!item || detailTransitionLocked) return;
    const commit = (fallbackAnimation = smooth) => {
      animateDetailEntry = fallbackAnimation;
      context.state.view = "detail";
      context.state.detailId = item.id;
      context.saveState();
      renderDetail(item.id);
    };
    const card = app.querySelector(".opportunity-card:not(.is-behind)");
    if (!smooth || !card || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit(false);
      return;
    }
    if (runSharedViewTransition(() => commit(false))) return;
    detailTransitionLocked = true;
    card.classList.add("open-detail");
    setTimeout(() => {
      commit(true);
      detailTransitionLocked = false;
    }, 220);
  }

  function passCurrent() {
    const item = currentOpportunity();
    if (!item || deckTransitionLocked) return;
    deckTransitionLocked = true;
    if (context.groupTrip?.isActive) {
      void context.groupTrip.recordChoice({ placeId: item.id, placeTitle: item.title, decision: "passed", surface: "card" }).catch(() => {});
    } else context.state.decisions[item.id] = "passed";
    context.recordEvent("passed", item.id, { source: "card", sharedTrip: Boolean(context.groupTrip?.isActive) });
    animateCard("left", () => {
      context.showToast("이번 추천은 넘겼어요");
      renderExplore();
      deckTransitionLocked = false;
    });
  }

  function saveOpportunity(id, source = "card") {
    const item = getOpportunity(id);
    if (!item) throw new Error(`Unknown opportunity: ${id}`);
    const savedAt = new Date().toISOString();
    if (context.groupTrip?.isActive) {
      void context.groupTrip.recordChoice({ placeId: item.id, placeTitle: item.title, decision: "saved", surface: source === "detail" ? "detail" : "card" }).catch(() => {});
    } else {
      context.state.saved[id] = {
        savedAt,
        visibleUntil: item.kind === "place" ? addDays(savedAt, 7) : undefined,
        attendedAt: null,
        review: "",
      };
    }
    context.recordEvent("saved", id, { source, sharedTrip: Boolean(context.groupTrip?.isActive), visibilityRule: item.kind === "event" && item.eventEnd ? "event_end" : "seven_days" });
  }

  function saveCurrent() {
    const item = currentOpportunity();
    if (!item || deckTransitionLocked) return;
    deckTransitionLocked = true;
    saveOpportunity(item.id, "swipe");
    animateCard("right", () => {
      context.showToast("저장했어요");
      renderExplore();
      deckTransitionLocked = false;
    });
  }

  function animateCard(direction, done) {
    const card = app.querySelector(".opportunity-card:not(.is-behind)");
    if (!card || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done();
      return;
    }
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      done();
    };
    card.style.removeProperty("--decision-opacity");
    delete card.dataset.direction;
    const onTransitionEnd = (event) => {
      if (event.propertyName !== "transform") return;
      card.removeEventListener("transitionend", onTransitionEnd);
      finish();
    };
    card.addEventListener("transitionend", onTransitionEnd);
    void card.offsetWidth;
    card.classList.add(direction === "left" ? "fly-left" : "fly-right");
    setTimeout(finish, 320);
  }

  function bindCardGesture() {
    const card = app.querySelector(".opportunity-card:not(.is-behind)");
    if (!card) return;
    let startX = 0;
    let startY = 0;
    let pointerId = null;
    let dragging = false;
    let settling = false;
    let suppressClickUntil = 0;
    let wheelDistance = 0;
    let wheelResetTimer;

    card.addEventListener("click", (event) => {
      if (performance.now() >= suppressClickUntil) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }, true);

    card.addEventListener("pointerdown", (event) => {
      if (settling) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      dragging = false;
    });
    card.addEventListener("pointermove", (event) => {
      if (settling || pointerId !== event.pointerId) return;
      const horizontal = event.clientX - startX;
      const vertical = event.clientY - startY;
      if (!dragging && Math.hypot(horizontal, vertical) < 8) return;
      if (!dragging) {
        dragging = true;
        card.setPointerCapture(pointerId);
        card.classList.add("is-dragging");
      }
      card.style.transform = `translateX(${horizontal}px) rotate(${horizontal / 22}deg)`;
      card.style.setProperty("--decision-opacity", String(Math.min(1, Math.abs(horizontal) / 90)));
      card.dataset.direction = horizontal >= 0 ? "save" : "pass";
    });
    const resetDrag = (event) => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      dragging = false;
      card.classList.remove("is-dragging");
      card.style.transform = "";
      card.style.removeProperty("--decision-opacity");
      delete card.dataset.direction;
      if (card.hasPointerCapture?.(event.pointerId)) card.releasePointerCapture(event.pointerId);
    };
    const finish = (event) => {
      if (settling || pointerId !== event.pointerId) return;
      const horizontal = event.clientX - startX;
      const vertical = event.clientY - startY;
      const wasDragging = dragging;
      pointerId = null;
      dragging = false;
      card.classList.remove("is-dragging");
      if (card.hasPointerCapture?.(event.pointerId)) card.releasePointerCapture(event.pointerId);
      if (wasDragging) suppressClickUntil = performance.now() + 500;
      if (wasDragging && Math.abs(horizontal) > 72 && Math.abs(horizontal) > Math.abs(vertical)) {
        event.preventDefault();
        settling = true;
        if (horizontal > 0) saveCurrent();
        else passCurrent();
        return;
      }
      card.style.transform = "";
      card.style.removeProperty("--decision-opacity");
      delete card.dataset.direction;
      if (wasDragging && vertical < -48 && Math.abs(vertical) > Math.abs(horizontal)) {
        event.preventDefault();
        settling = true;
        openDetail(currentOpportunity());
      }
    };
    card.addEventListener("pointerup", finish);
    card.addEventListener("pointercancel", resetDrag);
    card.addEventListener("wheel", (event) => {
      if (settling || event.deltaY <= 0) return;
      event.preventDefault();
      wheelDistance += event.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => { wheelDistance = 0; }, 180);
      if (wheelDistance < 54) return;
      settling = true;
      suppressClickUntil = performance.now() + 500;
      openDetail(currentOpportunity());
    }, { passive: false });
  }

  function backToExplore(smooth = false) {
    if (detailTransitionLocked) return;
    const commit = (fallbackAnimation = smooth) => {
      animateExploreReturn = fallbackAnimation;
      context.state.view = "explore";
      context.state.activeTab = "explore";
      context.state.activeCollectionId = null;
      context.saveState();
      renderExplore();
    };
    const detail = app.querySelector(".detail-screen");
    if (!smooth || !detail || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit(false);
      return;
    }
    if (runSharedViewTransition(() => commit(false))) return;
    detailTransitionLocked = true;
    detail.classList.add("is-returning");
    setTimeout(() => {
      commit(true);
      detailTransitionLocked = false;
    }, 210);
  }

  async function presentExploration(scene) {
    const externalSignals = { ...context.state.externalSignals };
    for (const signal of scene.externalSignals) externalSignals[signal.id] = signal;
    const { externalSignals: newSignals, ...activeExploration } = scene;
    context.state.externalSignals = externalSignals;
    context.state.activeExploration = {
      ...activeExploration,
      externalSignalIds: newSignals.map(({ id }) => id),
    };
    for (const candidate of scene.candidates) {
      delete context.state.decisions[candidate.id];
      delete context.state.photoIndices[candidate.id];
    }
    context.state.activeCollectionId = null;
    context.state.activeTab = "explore";
    context.state.view = "explore";
    context.recordEvent("agent_exploration_presented", null, {
      title: scene.title,
      candidateCount: scene.candidates.length,
      anchorCount: scene.anchors.length,
      externalSignalCount: newSignals.length,
    });
    context.render();
    const sharedRoom = await context.groupTrip?.publishScene(activeExploration);
    return {
      presented: true,
      sharedRoom: sharedRoom ?? null,
      title: scene.title,
      shownCount: scene.candidates.length,
      anchorCount: scene.anchors.length,
      externalSignalCount: newSignals.length,
      storedExternalSignalCount: Object.keys(externalSignals).length,
    };
  }

  function handleAction(button) {
    const action = button.dataset.action;
    const id = button.dataset.id ?? currentOpportunity()?.id;
    if (action === "next-photo" && id) movePhoto(getOpportunity(id), 1);
    else if (action === "pass") passCurrent();
    else if (action === "save") saveCurrent();
    else if (action === "back-explore") backToExplore();
    else if (action === "open-mohae-collection") {
      const collectionId = button.dataset.collectionId;
      const collection = collectionFor(collectionId);
      if (!collection) return false;
      context.state.activeExploration = null;
      context.state.activeCollectionId = collection.id;
      context.state.activeTab = "explore";
      context.state.view = "explore";
      context.recordEvent("mohae_collection_opened", id, { collectionId: collection.id, collectionLabel: collection.label, visibleCount: collection.items.length });
      renderExplore();
    } else if (action === "open-source-collection") {
      const url = button.dataset.url;
      if (!url) return false;
      context.recordEvent("source_collection_opened", id, { collectionId: button.dataset.collectionId, url });
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (action === "open-map") {
      context.state.activeCollectionId = null;
      context.state.activeTab = "map";
      context.state.view = "map";
      context.recordEvent("map_opened", null, { visibleCount: 0 });
      context.render();
    } else if (action === "open-profile") {
      context.state.view = "profile";
      context.saveState();
      context.render();
    } else if (action === "open-filter") renderFilter();
    else if (action === "close-sheet") closeSheet();
    else if (action === "set-filter") {
      context.state.activeExploration = null;
      context.state.filter = button.dataset.filter;
      context.state.view = "explore";
      context.saveState();
      closeSheet();
      renderExplore();
    } else if (action === "save-detail" && id) {
      if (!isSaved(id)) saveOpportunity(id, "detail");
      context.showToast("저장했어요");
      renderDetail(id);
    } else if (action === "route" && id) {
      context.recordEvent("route_opened", id);
      context.showToast("실제 제품에서는 지도 앱으로 연결됩니다");
    } else if (action === "booking-info" && id) {
      context.recordEvent("booking_info_opened", id);
      context.showToast(getOpportunity(id).kind === "event" ? "예약 정보는 다음 단계에서 연결됩니다" : "영업 정보는 다음 단계에서 연결됩니다");
    } else if (action === "next-source-batch") {
      void refreshAndLoadNextSourceBatch();
    } else if (action === "reset-deck") {
      context.state.decisions = {};
      context.recordEvent("deck_reset");
      renderExplore();
    } else if (action === "clear-exploration") {
      context.state.activeExploration = null;
      context.recordEvent("agent_exploration_cleared");
      renderExplore();
    } else if (action === "clear-collection") {
      const collectionId = context.state.activeCollectionId;
      context.state.activeCollectionId = null;
      context.recordEvent("mohae_collection_closed", null, { collectionId });
      renderExplore();
    } else return false;
    return true;
  }

  function handleKeyboard(key) {
    if (context.state.view === "explore") {
      if (key === "ArrowLeft") passCurrent();
      else if (key === "ArrowRight") saveCurrent();
      else if (key === "ArrowDown") openDetail(currentOpportunity());
      else return false;
      return true;
    }
    if (context.state.view === "detail" && key === "ArrowUp") {
      const scroller = app.querySelector(".detail-scroll");
      if (scroller && scroller.scrollTop <= 1) {
        backToExplore(true);
        return true;
      }
    }
    return false;
  }

  function handleEscape() {
    if (document.querySelector(".sheet-overlay")) {
      closeSheet();
      return true;
    }
    if (context.state.view === "detail" || context.state.view === "map") {
      backToExplore();
      return true;
    }
    return false;
  }

  return {
    handleAction,
    handleEscape,
    handleKeyboard,
    presentExploration,
    render,
  };
}
