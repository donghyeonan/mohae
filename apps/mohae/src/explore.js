import { DAY_MS, addDays, createId, escapeHtml, icon } from "./core.js";
import { opportunities } from "./sample-data.js";

const stopKindLabels = {
  accommodation: "숙소",
  airport: "공항",
  attraction: "명소",
  restaurant: "식당",
  other: "기타",
};

export function createExploreFeature(context) {
  const { app, bottomNav } = context;
  let filterReturnFocus = null;

  function getOpportunity(id) {
    return opportunities.find((item) => item.id === id) ?? null;
  }

  function getStop(id) {
    return context.state.plannedStops.find((stop) => stop.id === id) ?? null;
  }

  function mapIdForOpportunity(id) {
    return `opportunity:${id}`;
  }

  function mapIdForStop(id) {
    return `stop:${id}`;
  }

  function coordinatesForMapId(mapId) {
    if (mapId.startsWith("stop:")) {
      const stop = getStop(mapId.slice(5));
      return stop ? { latitude: stop.latitude, longitude: stop.longitude, name: stop.name } : null;
    }
    if (mapId.startsWith("opportunity:")) {
      const item = getOpportunity(mapId.slice(12));
      return item ? { latitude: item.latitude, longitude: item.longitude, name: item.title } : null;
    }
    return null;
  }

  function distanceKm(origin, destination) {
    const radians = (degrees) => (degrees * Math.PI) / 180;
    const latitudeDelta = radians(destination.latitude - origin.latitude);
    const longitudeDelta = radians(destination.longitude - origin.longitude);
    const startLatitude = radians(origin.latitude);
    const endLatitude = radians(destination.latitude);
    const haversine = Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }

  function availableOpportunities() {
    return opportunities.filter((item) => {
      const matchesFilter = context.state.filter === "all" || item.group === context.state.filter;
      const available = context.state.decisions[item.id] !== "passed" && !context.state.saved[item.id];
      return matchesFilter && available;
    });
  }

  function nearbyAvailableOpportunities(origin, radiusKm) {
    return availableOpportunities()
      .map((item) => ({ item, distanceKm: distanceKm(origin, item) }))
      .filter((candidate) => candidate.distanceKm <= radiusKm)
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }

  function visibleDeck() {
    const anchor = context.state.nearbyAnchor ? coordinatesForMapId(context.state.nearbyAnchor.mapId) : null;
    if (!anchor) return availableOpportunities();
    return nearbyAvailableOpportunities(anchor, context.state.nearbyAnchor.radiusKm)
      .map((candidate) => candidate.item);
  }

  function currentOpportunity() {
    return visibleDeck()[0] ?? null;
  }

  function displayDistance(item) {
    if (!context.state.nearbyAnchor) return item.distance;
    const anchor = coordinatesForMapId(context.state.nearbyAnchor.mapId);
    return anchor ? `${distanceKm(anchor, item).toFixed(1)}km` : item.distance;
  }

  function locationLine(item) {
    const distance = displayDistance(item);
    return distance ? `${item.location} · ${distance}` : item.location;
  }

  function imageSrc(src) {
    if (/^https:\/\/blogfiles\.pstatic\.net\//.test(src)) {
      return `https://search.pstatic.net/common/?autoRotate=true&quality=95&type=f750_750&src=${encodeURIComponent(src)}`;
    }
    return /^(https?:|data:|blob:)/.test(src) ? src : `./assets/${src}`;
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

  function statusTone(item) {
    return ["open", "limited", "closed"].includes(item.status?.tone) ? item.status.tone : "limited";
  }

  function observedDate(item) {
    if (!item.source?.observedAt) return "관측일 미상";
    return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "numeric", day: "numeric" }).format(new Date(item.source.observedAt));
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
    return `<article class="opportunity-card${behind ? " is-behind" : ""}" data-card-id="${item.id}" aria-label="${escapeHtml(item.title)}">
      <img data-card-image src="${escapeHtml(imageSrc(item.images[index]))}" alt="${escapeHtml(item.title)} 사진 ${index + 1}">
      ${photoProgress(item)}
      ${behind ? "" : `<span class="card-status is-${statusTone(item)}">${escapeHtml(item.status?.label ?? "운영정보 확인")}</span>
      <span class="card-photo-count">${index + 1}/${item.images.length}</span>
      <button class="photo-zone photo-prev" type="button" data-action="prev-photo" aria-label="이전 사진"></button>
      <button class="photo-zone photo-next" type="button" data-action="next-photo" aria-label="다음 사진"></button>
      <button class="card-information" type="button" data-action="open-detail" aria-label="${escapeHtml(item.title)} 자세히 보기">
        <span class="category-kicker">${escapeHtml(item.category)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <span class="card-subtitle">${escapeHtml(item.subtitle)}</span>
        <span class="card-chips"><i>${escapeHtml(locationLine(item))}</i><i>${escapeHtml(item.price)}</i></span>
        <span class="detail-hint">${icon("chevronUp")} 자세히</span>
      </button>`}
    </article>`;
  }

  function topbar() {
    return `<header class="topbar">
      <div class="wordmark"><span class="mark">✦</span><span>MOHAE</span></div>
      <div class="topbar-actions">
        <button class="square-button" type="button" data-action="open-map" aria-label="내 지도">${icon("map")}</button>
        <button class="square-button" type="button" data-action="open-filter" aria-label="추천 유형 필터">${icon("filter")}</button>
      </div>
    </header>`;
  }

  function renderExplore() {
    const items = visibleDeck();
    const item = items[0];
    const next = items[1];
    const anchor = context.state.nearbyAnchor ? coordinatesForMapId(context.state.nearbyAnchor.mapId) : null;
    bottomNav.classList.remove("is-hidden");
    app.innerHTML = `<section class="screen explore-screen" data-view="explore">
      ${topbar()}
      <div class="filter-summary">
        <span>${anchor ? `${escapeHtml(anchor.name)} 주변` : context.state.filter === "all" ? "새로운 곳 둘러보기" : context.state.filter === "event" ? "현재 프로그램" : "장소"}</span>
        ${anchor ? `<button type="button" data-action="clear-nearby">주변 추천 닫기</button>` : `<b>${items.length}개 남음</b>`}
      </div>
      <div class="deck" aria-live="polite">
        ${next ? cardMarkup(next, true) : ""}
        ${item ? cardMarkup(item) : `<div class="deck-empty"><span>✦</span><h2>지금 볼 추천이 없어요</h2><p>${anchor ? "반경을 넓히거나 주변 추천을 닫아보세요." : "저장한 경험은 지도에서 다시 볼 수 있어요."}</p><button type="button" data-action="${anchor ? "clear-nearby" : "reset-deck"}">${anchor ? "전체 추천 보기" : "넘긴 추천 다시 보기"}</button></div>`}
      </div>
      ${item ? `<div class="deck-actions" aria-label="추천 선택">
        <button class="action-button pass-button" type="button" data-action="pass" aria-label="넘기기">${icon("x")}</button>
        <button class="action-button save-button" type="button" data-action="save" aria-label="저장하기">${icon("heart")}</button>
      </div>` : ""}
      <p class="gesture-note">좌우로 선택 · 위로 밀어 자세히</p>
    </section>`;
    bindImageFallbacks();
    if (item) {
      const exposureKey = `seoul-gyeonggi-w35:${item.id}`;
      if (!context.state.exposed[exposureKey]) {
        context.state.exposed[exposureKey] = new Date().toISOString();
        context.recordEvent("exposed", item.id, { rank: 1, nearbyAnchor: context.state.nearbyAnchor?.mapId ?? null });
      }
      bindCardGesture();
    }
    context.syncNavigation();
  }

  function reviewBody(value, limit = 280) {
    const text = String(value ?? "").trim();
    return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
  }

  function renderOfficialFacts(item) {
    const facts = item.official ?? {};
    return `<section class="evidence-section">
      <div class="evidence-heading"><h2>이용 정보</h2></div>
      <dl class="official-facts">
        <div><dt>이용</dt><dd>${escapeHtml(facts.reservation ?? item.actionText ?? "확인 필요")}</dd></div>
        <div><dt>주차</dt><dd>${escapeHtml(facts.parking ?? "확인 필요")}</dd></div>
      </dl>
    </section>`;
  }

  function renderCaveat(item) {
    if (!item.caveatText) return "";
    return `<section class="evidence-section caveat-section">
      <div class="evidence-heading"><h2>방문 전 확인</h2></div>
      <p>${escapeHtml(item.caveatText)}</p>
    </section>`;
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
      ${item.menu?.length ? `<div class="menu-list">${item.menu.slice(0, 8).map((menu) => `<div><span><b>${escapeHtml(menu.name)}</b>${menu.description ? `<small>${escapeHtml(reviewBody(menu.description, 92))}</small>` : ""}</span><strong>${escapeHtml(menu.price)}</strong></div>`).join("")}</div>` : ""}
      ${item.menuMedia?.length ? `<div class="menu-media" aria-label="메뉴판 원본">${item.menuMedia.map((media, mediaIndex) => `<figure><img src="${escapeHtml(imageSrc(media.src))}" alt="${escapeHtml(item.title)} 메뉴판 원본" loading="lazy"><figcaption>메뉴판 원본</figcaption></figure>`).join("")}</div>` : ""}
    </section>`;
  }

  function renderReviewPatterns(item) {
    const evidence = item.reviewPatterns;
    if (!evidence) return "";
    return `<section class="evidence-section review-evidence">
      <div class="evidence-heading"><h2>방문자들이 반복해서 선택한 항목</h2></div>
      ${evidence.patterns?.length ? `<div class="review-pattern-list">${evidence.patterns.map((pattern) => `<div><strong>${escapeHtml(pattern.text)}</strong><span>최근 ${evidence.sampleSize}개 중 ${pattern.count}개</span></div>`).join("")}</div>` : `<p class="empty-evidence">반복해서 나타난 선택 항목이 없습니다.</p>`}
      <p class="coverage-note">최근 리뷰 ${evidence.sampleSize}개 중 선택 항목 기준입니다. 전체 방문자를 대표하지 않습니다.</p>
      <a class="inline-source-link" href="${escapeHtml(evidence.sourceUrl)}" target="_blank" rel="noopener noreferrer">네이버에서 리뷰 원문 보기</a>
    </section>`;
  }

  function renderSources(item) {
    return `<section class="source-footer">
      <span>정보 기준 ${escapeHtml(observedDate(item))}</span>
      <div class="source-links"><a href="${escapeHtml(item.externalLinks.map)}" target="_blank" rel="noopener noreferrer">네이버 지도</a>${item.externalLinks.official ? `<a href="${escapeHtml(item.externalLinks.official)}" target="_blank" rel="noopener noreferrer">공식 사이트</a>` : ""}</div>
    </section>`;
  }

  function renderDetail(id) {
    const item = getOpportunity(id);
    if (!item) {
      context.state.view = "explore";
      renderExplore();
      return;
    }
    const index = photoIndex(item);
    const photo = item.photoMeta?.[index];
    bottomNav.classList.add("is-hidden");
    app.innerHTML = `<section class="screen detail-screen" data-view="detail">
      <header class="detail-topbar">
        <button class="detail-back-button" type="button" data-action="back-explore" aria-label="탐색으로 돌아가기">${icon("arrowLeft")}<span>탐색</span></button>
        <div class="wordmark compact"><span class="mark">✦</span><span>MOHAE</span></div>
        <button class="square-button detail-more-button" type="button" data-action="detail-more" aria-label="더 보기">${icon("more")}</button>
      </header>
      <div class="detail-scroll">
        <figure class="detail-hero">
          <img data-card-image src="${escapeHtml(imageSrc(item.images[index]))}" alt="${escapeHtml(item.title)} 사진 ${index + 1}">
          ${photoProgress(item)}
          <div class="detail-photo-caption"><span>${index + 1}/${item.images.length}</span><b>${escapeHtml(photo?.source ?? "출처 확인")}${photo?.title ? ` · ${escapeHtml(photo.title)}` : ""}</b></div>
          <button class="photo-zone photo-prev" type="button" data-action="prev-photo" data-id="${item.id}" aria-label="이전 사진"></button>
          <button class="photo-zone photo-next" type="button" data-action="next-photo" data-id="${item.id}" aria-label="다음 사진"></button>
        </figure>
        <div class="detail-body">
          <div class="availability-card is-${statusTone(item)}"><strong>${escapeHtml(item.status?.label ?? "운영정보 확인")}</strong></div>
          <span class="category-kicker accent">${escapeHtml(item.category)}</span>
          <h1>${escapeHtml(item.title)}</h1>
          <p class="detail-subtitle">${escapeHtml(item.subtitle)}</p>
          <div class="fact-grid">
            <div>${icon("map")}<span><small>위치</small><b>${escapeHtml(item.address ?? locationLine(item))}</b></span></div>
            <div>${icon("calendar")}<span><small>운영</small><b>${escapeHtml(item.schedule)}</b></span></div>
            <div>${icon("wallet")}<span><small>비용</small><b>${escapeHtml(item.price)}</b></span></div>
          </div>
          ${renderOfficialFacts(item)}
          ${renderPrograms(item)}
          ${renderMenu(item)}
          ${renderReviewPatterns(item)}
          ${renderCaveat(item)}
          ${renderSources(item)}
          <div class="detail-cta-row">
            <a class="primary-action-cta" href="${escapeHtml(item.primaryAction?.url ?? item.externalLinks.map)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.primaryAction?.label ?? "현재 정보 확인")}</a>
            <a class="secondary-cta" href="${escapeHtml(item.externalLinks.map)}" target="_blank" rel="noopener noreferrer">${icon("route")} 네이버 지도</a>
            <a class="secondary-cta" href="${escapeHtml(item.externalLinks.reviews)}" target="_blank" rel="noopener noreferrer">${icon("calendar")} 리뷰 원문</a>
            <button class="primary-cta" type="button" data-action="save-detail" data-id="${item.id}">${context.state.saved[item.id] ? `${icon("check")} 저장됨` : `${icon("heart")} 저장하기`}</button>
          </div>
        </div>
      </div>
    </section>`;
    bindImageFallbacks();
    bindDetailBackGesture();
  }

  function bindDetailBackGesture() {
    const screen = app.querySelector(".detail-screen");
    if (!screen) return;
    let startX = 0;
    let startY = 0;
    let pointerId = null;
    screen.addEventListener("pointerdown", (event) => {
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
    });
    screen.addEventListener("pointerup", (event) => {
      if (pointerId !== event.pointerId) return;
      const horizontal = event.clientX - startX;
      const vertical = event.clientY - startY;
      pointerId = null;
      if (horizontal > 80 && Math.abs(horizontal) > Math.abs(vertical)) {
        event.preventDefault();
        backToExplore();
      }
    });
  }

  function expiryFor(item, saved) {
    return item.kind === "event" && item.eventEnd ? item.eventEnd : saved.visibleUntil ?? addDays(saved.savedAt, 7);
  }

  function isVisibleSave(item, saved) {
    return new Date(expiryFor(item, saved)).getTime() > Date.now();
  }

  function expiryLabel(item, saved) {
    const expiry = new Date(expiryFor(item, saved));
    if (item.kind === "event" && item.eventEnd) {
      return `프로그램 종료 ${expiry.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}까지`;
    }
    const days = Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / DAY_MS));
    return `지도에서 ${days}일 더 보여요`;
  }

  function visibleSavedItems() {
    return Object.entries(context.state.saved)
      .map(([id, saved]) => ({ item: getOpportunity(id), saved }))
      .filter(({ item, saved }) => item && isVisibleSave(item, saved));
  }

  function savedCardMarkup(item, saved) {
    const attended = Boolean(saved.attendedAt);
    const reviewOpen = context.state.reviewOpenId === item.id;
    const mapId = mapIdForOpportunity(item.id);
    return `<article class="saved-card ${context.state.selectedMapId === mapId ? "is-selected" : ""}" data-map-id="${mapId}">
      <button class="saved-select" type="button" data-action="select-map-item" data-map-id="${mapId}" aria-label="${escapeHtml(item.title)} 핀 선택">
        <img src="${escapeHtml(imageSrc(item.images[0]))}" alt="">
        <span><small>${escapeHtml(item.category)} · ${escapeHtml(item.location)}</small><strong>${escapeHtml(item.title)}</strong><em>${expiryLabel(item, saved)}</em></span>
      </button>
      <div class="saved-actions">
        ${item.kind === "place" ? `<button type="button" data-action="extend" data-id="${item.id}">${icon("plus")} 7일 연장</button>` : ""}
        <button class="${attended ? "is-done" : ""}" type="button" data-action="attend" data-id="${item.id}" ${attended ? "disabled" : ""}>${icon("check")} ${attended ? "다녀왔어요" : "다녀왔나요?"}</button>
      </div>
      ${attended ? `<div class="optional-review">
        ${saved.review ? `<p class="saved-review">“${escapeHtml(saved.review)}”</p>` : reviewOpen ? `<label for="review-${item.id}">선택 사항</label><textarea id="review-${item.id}" maxlength="180" placeholder="기억해둘 한 줄"></textarea><button type="button" data-action="save-review" data-id="${item.id}">후기 저장</button>` : `<button type="button" data-action="open-review" data-id="${item.id}">원하면 후기 남기기</button>`}
      </div>` : ""}
    </article>`;
  }

  function plannedStopMarkup(stop) {
    const mapId = mapIdForStop(stop.id);
    const visitLabel = stop.visitAt
      ? new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(stop.visitAt))
      : "시간 미정";
    return `<article class="planned-stop-card ${context.state.selectedMapId === mapId ? "is-selected" : ""}" data-map-id="${mapId}">
      <button class="planned-stop-select" type="button" data-action="select-map-item" data-map-id="${mapId}" aria-label="${escapeHtml(stop.name)} 핀 선택">
        <span class="stop-order">${stop.order}</span>
        <span><small>${escapeHtml(stopKindLabels[stop.kind] ?? stopKindLabels.other)} · ${escapeHtml(visitLabel)}</small><strong>${escapeHtml(stop.name)}</strong><em>${escapeHtml(stop.note || "Agent와 동선에 사용할 장소")}</em></span>
      </button>
      <button class="remove-stop" type="button" data-action="remove-plan-stop" data-id="${stop.id}" aria-label="${escapeHtml(stop.name)} 삭제">${icon("trash")} 지도에서 삭제</button>
    </article>`;
  }

  function projectedPin(latitude, longitude) {
    const x = Math.min(93, Math.max(7, ((longitude - 126.75) / 0.45) * 100));
    const y = Math.min(82, Math.max(12, ((37.7 - latitude) / 0.5) * 100));
    return [x, y];
  }

  function renderMap() {
    const savedItems = visibleSavedItems();
    const stops = [...context.state.plannedStops].sort((left, right) => left.order - right.order);
    const availableMapIds = [
      ...stops.map((stop) => mapIdForStop(stop.id)),
      ...savedItems.map(({ item }) => mapIdForOpportunity(item.id)),
    ];
    if (!availableMapIds.includes(context.state.selectedMapId)) {
      context.state.selectedMapId = availableMapIds[0] ?? null;
    }
    bottomNav.classList.add("is-hidden");
    app.innerHTML = `<section class="screen map-screen" data-view="map">
      <header class="map-topbar">
        <button class="round-back" type="button" data-action="back-explore" aria-label="탐색으로 돌아가기">${icon("arrowLeft")}</button>
        <div><small>내 지도</small><strong>${availableMapIds.length}곳</strong></div>
        <button class="round-back" type="button" data-action="map-agent-help" aria-label="Agent로 장소 추가">${icon("plus")}</button>
      </header>
      <div class="map-canvas" aria-label="저장한 경험과 계획 장소 지도">
        <svg class="map-lines" viewBox="0 0 390 520" aria-hidden="true">
          <path d="M-20 95C72 136 83 44 176 92s134 5 238 64"/>
          <path d="M22 8c40 93 76 115 63 214s61 119 43 310"/>
          <path d="M-12 285c83-35 131-5 184 45s149 40 246-9"/>
          <path d="M225-20c-14 91 36 112 8 195s22 133 108 174"/>
          <path class="river" d="M-30 211c103-39 186 11 242 25s116-15 213-69"/>
        </svg>
        <span class="map-label seoul">SEOUL</span><span class="map-label gyeonggi">GYEONGGI</span>
        ${savedItems.map(({ item }) => `<button class="map-pin ${context.state.selectedMapId === mapIdForOpportunity(item.id) ? "is-active" : ""}" style="--x:${item.pin[0]}%;--y:${item.pin[1]}%" type="button" data-action="select-map-item" data-map-id="${mapIdForOpportunity(item.id)}" aria-label="${escapeHtml(item.title)}">${icon("map")}</button>`).join("")}
        ${stops.map((stop) => {
          const [x, y] = projectedPin(stop.latitude, stop.longitude);
          return `<button class="plan-pin ${context.state.selectedMapId === mapIdForStop(stop.id) ? "is-active" : ""}" style="--x:${x}%;--y:${y}%" type="button" data-action="select-map-item" data-map-id="${mapIdForStop(stop.id)}" aria-label="${escapeHtml(stop.name)}"><span>${stop.order}</span></button>`;
        }).join("")}
        <button class="locate-button" type="button" data-action="recenter-map" aria-label="현재 위치">${icon("focus")}</button>
      </div>
      <section class="saved-sheet">
        <div class="sheet-handle"></div>
        <div class="map-sheet-heading"><span><b>계획 ${stops.length}</b><i>저장 ${savedItems.length}</i></span><small>Agent가 추가한 장소도 같은 지도에 표시됩니다.</small></div>
        ${availableMapIds.length ? `<div class="saved-rail">${stops.map(plannedStopMarkup).join("")}${savedItems.map(({ item, saved }) => savedCardMarkup(item, saved)).join("")}</div>` : `<div class="saved-empty"><span>♡</span><h2>지도에 장소가 아직 없어요</h2><p>경험을 저장하거나 Agent에게 숙소·공항·명소를 추가해 달라고 요청하세요.</p></div>`}
      </section>
    </section>`;
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
    else if (context.state.view === "map") renderMap();
    else renderExplore();
  }

  function movePhoto(item, direction) {
    const current = photoIndex(item);
    context.state.photoIndices[item.id] = (current + direction + item.images.length) % item.images.length;
    context.saveState();
    render();
  }

  function passCurrent() {
    const item = currentOpportunity();
    if (!item) return;
    context.state.decisions[item.id] = "passed";
    context.recordEvent("passed", item.id);
    animateCard("left", () => {
      context.showToast("이번 추천은 넘겼어요");
      renderExplore();
    });
  }

  function saveOpportunity(id, source = "card") {
    const item = getOpportunity(id);
    if (!item) throw new Error(`Unknown opportunity: ${id}`);
    const savedAt = new Date().toISOString();
    context.state.saved[id] = {
      savedAt,
      visibleUntil: item.kind === "place" ? addDays(savedAt, 7) : undefined,
      attendedAt: null,
      review: "",
    };
    context.state.selectedMapId = mapIdForOpportunity(id);
    context.recordEvent("saved", id, { source, visibilityRule: item.kind === "event" && item.eventEnd ? "event_end" : "seven_days" });
  }

  function saveCurrent() {
    const item = currentOpportunity();
    if (!item) return;
    saveOpportunity(item.id, "swipe");
    animateCard("right", () => {
      context.showToast(item.kind === "event" && item.eventEnd ? "프로그램 종료일까지 지도에 저장했어요" : "7일 동안 지도에 저장했어요");
      renderExplore();
    });
  }

  function animateCard(direction, done) {
    const card = app.querySelector(".opportunity-card:not(.is-behind)");
    if (!card || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done();
      return;
    }
    card.classList.add(direction === "left" ? "fly-left" : "fly-right");
    setTimeout(done, 330);
  }

  function bindCardGesture() {
    const card = app.querySelector(".opportunity-card:not(.is-behind)");
    if (!card) return;
    let startX = 0;
    let startY = 0;
    let pointerId = null;
    let dragging = false;
    card.addEventListener("pointerdown", (event) => {
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      dragging = false;
    });
    card.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
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
    const finish = (event) => {
      if (pointerId !== event.pointerId) return;
      const horizontal = event.clientX - startX;
      const vertical = event.clientY - startY;
      pointerId = null;
      card.classList.remove("is-dragging");
      if (card.hasPointerCapture?.(event.pointerId)) card.releasePointerCapture(event.pointerId);
      if (dragging && Math.abs(horizontal) > 72 && Math.abs(horizontal) > Math.abs(vertical)) {
        event.preventDefault();
        if (horizontal > 0) saveCurrent();
        else passCurrent();
        return;
      }
      card.style.transform = "";
      card.style.removeProperty("--decision-opacity");
      delete card.dataset.direction;
      if (dragging && vertical < -48 && Math.abs(vertical) > Math.abs(horizontal)) {
        event.preventDefault();
        const item = currentOpportunity();
        if (item) {
          context.state.view = "detail";
          context.state.detailId = item.id;
          context.saveState();
          renderDetail(item.id);
        }
      }
    };
    card.addEventListener("pointerup", finish);
    card.addEventListener("pointercancel", finish);
  }

  function backToExplore() {
    context.state.view = "explore";
    context.state.activeTab = "explore";
    context.saveState();
    renderExplore();
  }

  function addPlanStop(input) {
    const latitude = Number(input.latitude);
    const longitude = Number(input.longitude);
    if (!input.name?.trim()) throw new Error("A map stop requires a name.");
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error("Latitude must be between -90 and 90.");
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error("Longitude must be between -180 and 180.");
    const kind = stopKindLabels[input.kind] ? input.kind : "other";
    if (input.visitAt && Number.isNaN(new Date(input.visitAt).getTime())) throw new Error("visitAt must be a valid ISO 8601 date-time.");
    const highestOrder = context.state.plannedStops.reduce((highest, stop) => Math.max(highest, stop.order), 0);
    const requestedOrder = Number(input.order);
    const order = Number.isInteger(requestedOrder) && requestedOrder > 0
      ? Math.min(requestedOrder, highestOrder + 1)
      : highestOrder + 1;
    for (const existing of context.state.plannedStops) {
      if (existing.order >= order) existing.order += 1;
    }
    const stop = {
      id: createId("map"),
      name: input.name.trim().slice(0, 120),
      kind,
      latitude,
      longitude,
      visitAt: input.visitAt || null,
      order,
      note: input.note?.trim().slice(0, 240) || "",
      source: input.source === "user" ? "user" : "agent",
      createdAt: new Date().toISOString(),
    };
    context.state.plannedStops.push(stop);
    context.state.selectedMapId = mapIdForStop(stop.id);
    context.state.activeTab = "explore";
    context.state.view = "map";
    context.recordEvent("map_stop_added", null, { stopId: stop.id, name: stop.name, source: stop.source });
    context.render();
    return { ...stop, mapId: mapIdForStop(stop.id) };
  }

  function removePlanStop(id) {
    const stop = getStop(id);
    if (!stop) return false;
    context.state.plannedStops = context.state.plannedStops
      .filter((candidate) => candidate.id !== id)
      .sort((left, right) => left.order - right.order);
    context.state.plannedStops.forEach((candidate, index) => {
      candidate.order = index + 1;
    });
    if (context.state.nearbyAnchor?.mapId === mapIdForStop(id)) context.state.nearbyAnchor = null;
    context.recordEvent("map_stop_removed", null, { stopId: id, name: stop.name });
    context.showToast(`${stop.name}을 지도에서 삭제했어요`);
    renderMap();
    return true;
  }

  function focusMapPlace(mapId) {
    const place = coordinatesForMapId(mapId);
    if (!place) throw new Error(`Unknown map place: ${mapId}`);
    context.state.selectedMapId = mapId;
    context.state.activeTab = "explore";
    context.state.view = "map";
    context.recordEvent("map_place_focused", null, { mapId });
    context.render();
    return { mapId, ...place };
  }

  function recommendNearPlace(mapId, radiusKm = 10, limit = 5) {
    const origin = coordinatesForMapId(mapId);
    if (!origin) throw new Error(`Unknown map place: ${mapId}`);
    const normalizedRadius = Math.min(100, Math.max(0.1, Number(radiusKm) || 10));
    const normalizedLimit = Math.min(20, Math.max(1, Math.floor(Number(limit) || 5)));
    return nearbyAvailableOpportunities(origin, normalizedRadius)
      .slice(0, normalizedLimit)
      .map(({ item, distanceKm: rawDistanceKm }) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        location: item.location,
        schedule: item.schedule,
        price: item.price,
        distanceKm: Number(rawDistanceKm.toFixed(1)),
      }));
  }

  function exploreNearPlace(mapId, radiusKm = 10) {
    const origin = coordinatesForMapId(mapId);
    if (!origin) throw new Error(`Unknown map place: ${mapId}`);
    const normalizedRadius = Math.min(100, Math.max(0.1, Number(radiusKm) || 10));
    context.state.nearbyAnchor = { mapId, radiusKm: normalizedRadius };
    context.state.activeTab = "explore";
    context.state.view = "explore";
    context.recordEvent("nearby_explore_started", null, { mapId, radiusKm: normalizedRadius });
    context.render();
    return { mapId, placeName: origin.name, radiusKm: normalizedRadius, visibleCount: visibleDeck().length };
  }

  function getMapContext() {
    return {
      plannedStops: [...context.state.plannedStops]
        .sort((left, right) => left.order - right.order)
        .map((stop) => ({
          mapId: mapIdForStop(stop.id),
          name: stop.name,
          kind: stop.kind,
          latitude: stop.latitude,
          longitude: stop.longitude,
          visitAt: stop.visitAt,
          order: stop.order,
          note: stop.note,
        })),
      savedOpportunities: visibleSavedItems().map(({ item }) => ({
        mapId: mapIdForOpportunity(item.id),
        opportunityId: item.id,
        title: item.title,
        category: item.category,
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        schedule: item.schedule,
      })),
    };
  }

  function handleAction(button) {
    const action = button.dataset.action;
    const id = button.dataset.id ?? currentOpportunity()?.id;
    if (action === "prev-photo" && id) movePhoto(getOpportunity(id), -1);
    else if (action === "next-photo" && id) movePhoto(getOpportunity(id), 1);
    else if (action === "pass") passCurrent();
    else if (action === "save") saveCurrent();
    else if (action === "open-detail" && id) {
      context.state.view = "detail";
      context.state.detailId = id;
      context.saveState();
      renderDetail(id);
    } else if (action === "back-explore") backToExplore();
    else if (action === "open-map") {
      context.state.view = "map";
      context.recordEvent("map_opened", null, { visibleCount: getMapContext().plannedStops.length + getMapContext().savedOpportunities.length });
      renderMap();
    } else if (action === "open-filter") renderFilter();
    else if (action === "close-sheet") closeSheet();
    else if (action === "set-filter") {
      context.state.filter = button.dataset.filter;
      context.state.view = "explore";
      context.saveState();
      closeSheet();
      renderExplore();
    } else if (action === "save-detail" && id) {
      if (!context.state.saved[id]) saveOpportunity(id, "detail");
      const item = getOpportunity(id);
      context.showToast(item.kind === "event" && item.eventEnd ? "프로그램 종료일까지 지도에 저장했어요" : "7일 동안 지도에 저장했어요");
      renderDetail(id);
    } else if (action === "route" && id) {
      context.recordEvent("route_opened", id);
      context.showToast("실제 제품에서는 지도 앱으로 연결됩니다");
    } else if (action === "booking-info" && id) {
      context.recordEvent("booking_info_opened", id);
      context.showToast(getOpportunity(id).kind === "event" ? "예약 정보는 다음 단계에서 연결됩니다" : "영업 정보는 다음 단계에서 연결됩니다");
    } else if (action === "detail-more") context.showToast("추가 메뉴는 다음 단계에서 연결됩니다");
    else if (action === "recenter-map") context.showToast("현재 위치로 지도를 맞췄어요");
    else if (action === "map-agent-help") context.showToast("Agent에게 숙소·공항·명소를 이 지도에 추가해 달라고 요청하세요");
    else if (action === "select-map-item") {
      const mapId = button.dataset.mapId;
      if (mapId) {
        context.state.selectedMapId = mapId;
        context.saveState();
        renderMap();
        requestAnimationFrame(() => document.querySelector(`[data-map-id="${CSS.escape(mapId)}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }));
      }
    } else if (action === "remove-plan-stop" && id) removePlanStop(id);
    else if (action === "extend" && id) {
      const saved = context.state.saved[id];
      saved.visibleUntil = addDays(expiryFor(getOpportunity(id), saved), 7);
      context.recordEvent("extended", id, { days: 7, visibleUntil: saved.visibleUntil });
      context.showToast("지도 표시를 7일 연장했어요");
      renderMap();
    } else if (action === "attend" && id) {
      context.state.saved[id].attendedAt = new Date().toISOString();
      context.recordEvent("attended", id);
      context.showToast("다녀온 경험으로 기록했어요");
      renderMap();
    } else if (action === "open-review" && id) {
      context.state.reviewOpenId = id;
      context.saveState();
      renderMap();
      document.querySelector(`#review-${CSS.escape(id)}`)?.focus();
    } else if (action === "save-review" && id) {
      const field = document.querySelector(`#review-${CSS.escape(id)}`);
      const review = field?.value.trim() ?? "";
      if (!review) {
        context.showToast("남기고 싶은 내용이 있을 때만 적어주세요");
      } else {
        context.state.saved[id].review = review;
        context.state.reviewOpenId = null;
        context.recordEvent("reviewed", id, { text: review });
        context.showToast("후기를 저장했어요");
        renderMap();
      }
    } else if (action === "reset-deck") {
      context.state.decisions = {};
      context.recordEvent("deck_reset");
      renderExplore();
    } else if (action === "clear-nearby") {
      context.state.nearbyAnchor = null;
      context.recordEvent("nearby_explore_closed");
      renderExplore();
    } else return false;
    return true;
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
    addPlanStop,
    exploreNearPlace,
    focusMapPlace,
    getMapContext,
    handleAction,
    handleEscape,
    recommendNearPlace,
    render,
  };
}
