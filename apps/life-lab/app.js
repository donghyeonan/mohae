const STORAGE_KEY = "life-lab-tinder-prototype-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

const opportunities = [
  {
    id: "pottery-yeonnam",
    kind: "event",
    group: "event",
    category: "클래스",
    title: "연남의 작은 도예 수업",
    subtitle: "처음이어도 한 개는 완성하는 저녁",
    location: "서울 연남동",
    distance: "34분",
    schedule: "9월 5일 · 19:30",
    price: "₩38,000",
    eventEnd: "2026-09-05T22:00:00+09:00",
    why: "이번 주 저녁 약속이 적고, 손을 쓰는 활동은 아직 해본 적이 없어요.",
    description: "여섯 명만 받는 초보자용 물레 수업입니다. 흙을 고르고 중심을 잡는 법부터 시작해 작은 그릇 하나를 완성합니다.",
    note: "앞치마와 재료는 준비되어 있어요. 완성품은 소성 후 찾아갑니다.",
    images: ["pottery-1.jpg", "pottery-2.jpg", "pottery-3.jpg"],
    pin: [37, 40],
  },
  {
    id: "jazz-euljiro",
    kind: "event",
    group: "event",
    category: "공연",
    title: "을지로 레이트 나이트 재즈",
    subtitle: "서른 명만 들어가는 작은 라이브",
    location: "서울 을지로",
    distance: "28분",
    schedule: "9월 12일 · 20:00",
    price: "₩25,000",
    eventEnd: "2026-09-12T23:00:00+09:00",
    why: "저장한 카페는 조용한 공간이 많지만, 라이브 음악 경험은 거의 없어요.",
    description: "색소폰과 피아노 듀오가 두 세트로 연주합니다. 좌석 간격이 넓고 혼자 와도 부담 없는 공연입니다.",
    note: "입장은 공연 30분 전부터입니다. 음료 한 잔이 포함됩니다.",
    images: ["jazz-1.jpg", "jazz-2.jpg"],
    pin: [54, 34],
  },
  {
    id: "climbing-suwon",
    kind: "event",
    group: "event",
    category: "스포츠",
    title: "수원 초보 볼더링 세션",
    subtitle: "강습 40분 뒤 자유롭게 더 타보기",
    location: "경기 수원시",
    distance: "51분",
    schedule: "9월 6일 · 15:00",
    price: "₩22,000",
    eventEnd: "2026-09-06T18:00:00+09:00",
    why: "새로운 활동을 한 날에 저녁 에너지 기록이 조금 높았어요.",
    description: "신발 착용부터 안전하게 떨어지는 법까지 배우는 입문 세션입니다. 강습 후 한 시간 동안 자유 이용할 수 있습니다.",
    note: "운동복과 양말만 가져오면 됩니다. 암벽화는 대여에 포함됩니다.",
    images: ["climbing-1.jpg", "climbing-2.jpg"],
    pin: [42, 72],
  },
  {
    id: "cafe-haenggung",
    kind: "place",
    group: "place",
    category: "카페",
    title: "행궁동 오래된 주택 카페",
    subtitle: "마당이 있고 대화가 조용한 곳",
    location: "경기 수원시",
    distance: "47분",
    schedule: "오늘 · 22:00까지",
    price: "₩7,000대",
    why: "밝은 체인점보다 오래된 건물의 작은 공간을 더 자주 저장했어요.",
    description: "한옥과 1970년대 주택을 이어 만든 카페입니다. 좌석 수가 적고 음악이 크지 않아 혼자 머물기에도 좋습니다.",
    note: "주말 14~17시는 대기가 생길 수 있어요.",
    images: ["cafe-1.jpg", "cafe-2.jpg"],
    pin: [48, 69],
  },
  {
    id: "art-seongsu",
    kind: "event",
    group: "event",
    category: "전시",
    title: "성수의 밤, 빛과 소리 전시",
    subtitle: "창고 전체를 걷는 55분의 설치 작업",
    location: "서울 성수동",
    distance: "31분",
    schedule: "9월 27일까지",
    price: "₩18,000",
    eventEnd: "2026-09-27T20:00:00+09:00",
    why: "이번 주말 오후가 비어 있고, 평소 선택한 전시보다 조금 더 낯선 형식이에요.",
    description: "빛, 저주파 음향, 움직이는 천을 따라 네 개의 방을 걷는 설치 전시입니다. 정해진 순서 없이 머물 수 있습니다.",
    note: "한 회차 입장은 40명으로 제한됩니다.",
    images: ["art-1.jpg", "art-2.jpg"],
    pin: [67, 40],
  },
];

const DEFAULT_HOURLY_WAGE = 50000;
const metricData = [
  {
    key: "sleep",
    label: "수면",
    value: "7h 23m",
    context: "75% 퍼포먼스",
    icon: "moon",
    score: 75,
    detailLabel: "수면 퍼포먼스",
    summary: "필요한 수면 시간은 대부분 채웠지만, 취침 시간의 일관성이 낮았어요.",
    insight: "오늘은 취침 시작 시간을 어제보다 30분만 앞당기면 수면 일관성을 회복하기 쉬워요.",
    factors: [
      { label: "필요 수면 충족", value: "74%", percent: 74, icon: "moon" },
      { label: "수면 일관성", value: "45%", percent: 45, icon: "clock" },
      { label: "수면 효율", value: "98%", percent: 98, icon: "spark" },
      { label: "높은 수면 스트레스", value: "0%", percent: 0, icon: "activity" },
    ],
    history: [58, 64, 61, 73, 69, 82, 75],
  },
  {
    key: "recovery",
    label: "회복",
    value: "85%",
    context: "오늘은 준비됐어요",
    icon: "heart",
    score: 85,
    detailLabel: "회복 준비도",
    summary: "HRV가 평소보다 높고 안정 심박과 호흡은 개인 기준 범위 안에 있어요.",
    insight: "몸이 강한 활동을 받아들일 준비가 된 날이에요. 오후의 에너지 변화만 한 번 더 확인해보세요.",
    factors: [
      { label: "심박 변이도", value: "124 ms", percent: 92, icon: "activity" },
      { label: "안정 심박수", value: "49 bpm", percent: 84, icon: "heart" },
      { label: "호흡수", value: "14.5 /min", percent: 78, icon: "focus" },
      { label: "수면 퍼포먼스", value: "75%", percent: 75, icon: "moon" },
    ],
    history: [69, 71, 63, 78, 81, 76, 85],
  },
  {
    key: "activity",
    label: "활동",
    value: "320 kcal",
    context: "목표의 70%",
    icon: "activity",
    score: 70,
    detailLabel: "활동 목표",
    summary: "걷기와 짧은 근력 운동으로 오늘 목표의 70%를 채웠어요.",
    insight: "저녁에 18분 정도 걸으면 추가 운동 없이도 오늘 활동 목표에 가까워져요.",
    factors: [
      { label: "활동 칼로리", value: "320 kcal", percent: 70, icon: "activity" },
      { label: "걷기", value: "31분", percent: 68, icon: "route" },
      { label: "근력 운동", value: "11분", percent: 44, icon: "spark" },
      { label: "일어서기", value: "10 / 12h", percent: 83, icon: "clock" },
    ],
    history: [44, 59, 72, 65, 81, 54, 70],
  },
  {
    key: "focus",
    label: "집중",
    value: "3h 10m",
    context: "오전이 가장 안정적",
    icon: "focus",
    score: 79,
    detailLabel: "집중 리듬",
    summary: "오전 집중 블록은 길었고, 오후에는 짧은 중단이 네 번 있었어요.",
    insight: "다음 긴 작업은 오전 10시 전에 두는 편이 지금의 집중 리듬과 가장 잘 맞아요.",
    factors: [
      { label: "총 집중 시간", value: "3h 10m", percent: 79, icon: "focus" },
      { label: "최장 집중 블록", value: "74분", percent: 88, icon: "clock" },
      { label: "중단 횟수", value: "4회", percent: 66, icon: "activity" },
      { label: "오전 집중도", value: "82%", percent: 82, icon: "sun" },
    ],
    history: [63, 76, 71, 84, 68, 73, 79],
  },
];

const iconPaths = {
  arrowLeft: '<path d="m15 18-6-6 6-6"/>',
  map: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  filter: '<path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6a5.5 5.5 0 0 0 1-8.8Z"/>',
  chevronUp: '<path d="m18 15-6-6-6 6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  calendar: '<path d="M8 2v4M16 2v4M3 10h18"/><rect width="18" height="18" x="3" y="4" rx="2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V6"/><path d="M16 13h.01"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 17V8a3 3 0 0 1 3-3h7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  activity: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
  focus: '<circle cx="12" cy="12" r="3"/><path d="M3 12a9 9 0 0 1 9-9M21 12a9 9 0 0 1-9 9M12 21a9 9 0 0 1-9-9M12 3a9 9 0 0 1 9 9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
  spark: '<path d="m12 3-1.7 4.3L6 9l4.3 1.7L12 15l1.7-4.3L18 9l-4.3-1.7Z"/><path d="m19 16-.8 2.2L16 19l2.2.8L19 22l.8-2.2L22 19l-2.2-.8Z"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
};

function icon(name, className = "") {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] ?? ""}</svg>`;
}

function addDays(value, days) {
  return new Date(new Date(value).getTime() + days * DAY_MS).toISOString();
}

function initialState() {
  const now = new Date().toISOString();
  return {
    activeTab: "explore",
    view: "explore",
    filter: "all",
    statusMode: "grid",
    metricDetailKey: null,
    hourlyWage: DEFAULT_HOURLY_WAGE,
    photoIndices: {},
    decisions: {},
    saved: {
      "jazz-euljiro": { savedAt: now, attendedAt: null, review: "" },
      "art-seongsu": { savedAt: now, attendedAt: null, review: "" },
    },
    selectedSavedId: "jazz-euljiro",
    reviewOpenId: null,
    eventLog: [],
    exposed: {},
  };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return initialState();
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

let state = loadState();
const app = document.querySelector("#app");
const bottomNav = document.querySelector("#bottomNav");
const toast = document.querySelector("#toast");
let toastTimer;
let valueCounterTimer;
let filterReturnFocus = null;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function recordEvent(type, opportunityId = null, metadata = {}) {
  const event = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
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

function stopValueCounter() {
  clearInterval(valueCounterTimer);
  valueCounterTimer = undefined;
}

function currentTimeValue() {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const elapsed = Math.max(0, now.getTime() - dayStart.getTime());
  const hourlyWage = Number(state.hourlyWage) || DEFAULT_HOURLY_WAGE;
  return Math.floor((elapsed / (60 * 60 * 1000)) * hourlyWage);
}

function todayLabel() {
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(new Date());
}

function updateValueCounter() {
  const counter = app.querySelector("[data-live-value]");
  if (!counter) return;
  const value = currentTimeValue();
  counter.textContent = `-₩${value.toLocaleString("ko-KR")}`;
  counter.setAttribute("aria-label", `오늘 사용한 시간 가치 ${value.toLocaleString("ko-KR")}원`);
  const date = app.querySelector("[data-today-label]");
  if (date) date.textContent = todayLabel();
}

function startValueCounter() {
  stopValueCounter();
  updateValueCounter();
  valueCounterTimer = setInterval(updateValueCounter, 250);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getOpportunity(id) {
  return opportunities.find((item) => item.id === id) ?? opportunities[0];
}

function visibleDeck() {
  return opportunities.filter((item) => {
    const matches = state.filter === "all" || item.group === state.filter;
    return matches && state.decisions[item.id] !== "passed" && !state.saved[item.id];
  });
}

function currentOpportunity() {
  return visibleDeck()[0] ?? null;
}

function photoIndex(item) {
  return Math.min(state.photoIndices[item.id] ?? 0, item.images.length - 1);
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
    <img src="./assets/${item.images[index]}" alt="${escapeHtml(item.title)} 사진 ${index + 1}">
    ${photoProgress(item)}
    ${behind ? "" : `<button class="photo-zone photo-prev" type="button" data-action="prev-photo" aria-label="이전 사진"></button>
    <button class="photo-zone photo-next" type="button" data-action="next-photo" aria-label="다음 사진"></button>
    <button class="card-information" type="button" data-action="open-detail" aria-label="${escapeHtml(item.title)} 자세히 보기">
      <span class="category-kicker">${escapeHtml(item.category)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <span class="card-subtitle">${escapeHtml(item.subtitle)}</span>
      <span class="card-chips"><i>${escapeHtml(item.location)} · ${escapeHtml(item.distance)}</i><i>${escapeHtml(item.price)}</i></span>
      <span class="detail-hint">${icon("chevronUp")} 자세히</span>
    </button>`}
  </article>`;
}

function topbar() {
  return `<header class="topbar">
    <div class="wordmark"><span class="mark">✦</span><span>life lab</span></div>
    <div class="topbar-actions">
      <button class="square-button" type="button" data-action="open-map" aria-label="저장한 경험 지도">${icon("map")}</button>
      <button class="square-button" type="button" data-action="open-filter" aria-label="추천 유형 필터">${icon("filter")}</button>
    </div>
  </header>`;
}

function renderExplore() {
  const items = visibleDeck();
  const item = items[0];
  const next = items[1];
  bottomNav.classList.remove("is-hidden");
  app.innerHTML = `<section class="screen explore-screen" data-view="explore">
    ${topbar()}
    <div class="filter-summary"><span>${state.filter === "all" ? "전체 경험" : state.filter === "event" ? "이벤트" : "맛집·카페"}</span><b>${items.length}개 남음</b></div>
    <div class="deck" aria-live="polite">
      ${next ? cardMarkup(next, true) : ""}
      ${item ? cardMarkup(item) : `<div class="deck-empty"><span>✦</span><h2>이번 추천을 모두 봤어요</h2><p>저장한 경험은 지도에서 다시 볼 수 있어요.</p><button type="button" data-action="reset-deck">넘긴 추천 다시 보기</button></div>`}
    </div>
    ${item ? `<div class="deck-actions" aria-label="추천 선택">
      <button class="action-button pass-button" type="button" data-action="pass" aria-label="넘기기">${icon("x")}</button>
      <button class="action-button save-button" type="button" data-action="save" aria-label="저장하기">${icon("heart")}</button>
    </div>` : ""}
    <p class="gesture-note">좌우로 선택 · 위로 밀어 자세히</p>
  </section>`;
  if (item) {
    const exposureKey = `seoul-gyeonggi-w35:${item.id}`;
    if (!state.exposed[exposureKey]) {
      state.exposed[exposureKey] = new Date().toISOString();
      recordEvent("exposed", item.id, { rank: 1 });
    }
    bindCardGesture();
  }
  syncNavigation();
}

function renderDetail(id) {
  const item = getOpportunity(id);
  const index = photoIndex(item);
  bottomNav.classList.add("is-hidden");
  app.innerHTML = `<section class="screen detail-screen" data-view="detail">
    <header class="detail-topbar">
      <button class="detail-back-button" type="button" data-action="back-explore" aria-label="탐색으로 돌아가기">${icon("arrowLeft")}<span>탐색</span></button>
      <div class="wordmark compact"><span class="mark">✦</span><span>life lab</span></div>
      <button class="square-button detail-more-button" type="button" data-action="detail-more" aria-label="더 보기">${icon("more")}</button>
    </header>
    <div class="detail-scroll">
      <div class="detail-hero">
        <img src="./assets/${item.images[index]}" alt="${escapeHtml(item.title)} 사진 ${index + 1}">
        ${photoProgress(item)}
        <button class="photo-zone photo-prev" type="button" data-action="prev-photo" data-id="${item.id}" aria-label="이전 사진"></button>
        <button class="photo-zone photo-next" type="button" data-action="next-photo" data-id="${item.id}" aria-label="다음 사진"></button>
      </div>
      <div class="detail-body">
        <span class="category-kicker accent">${escapeHtml(item.category)}</span>
        <h1>${escapeHtml(item.title)}</h1>
        <p class="detail-subtitle">${escapeHtml(item.subtitle)}</p>
        <div class="fact-grid">
          <div>${icon("calendar")}<span><small>언제</small><b>${escapeHtml(item.schedule)}</b></span></div>
          <div>${icon("map")}<span><small>어디서</small><b>${escapeHtml(item.location)} · ${escapeHtml(item.distance)}</b></span></div>
          <div>${icon("wallet")}<span><small>예상 비용</small><b>${escapeHtml(item.price)}</b></span></div>
        </div>
        <section class="why-card"><span>왜 지금 보여줬나요?</span><p>${escapeHtml(item.why)}</p></section>
        <section class="detail-copy"><h2>이 경험에 관해</h2><p>${escapeHtml(item.description)}</p><p class="note">${escapeHtml(item.note)}</p></section>
        <div class="detail-tags"><span>${escapeHtml(item.category)}</span><span>${item.location.startsWith("서울") ? "서울" : "경기"}</span><span>${item.kind === "event" ? "예약 필요" : "상시 방문"}</span></div>
        <div class="detail-cta-row">
          <button class="secondary-cta" type="button" data-action="route" data-id="${item.id}">${icon("route")} 길찾기</button>
          <button class="secondary-cta" type="button" data-action="booking-info" data-id="${item.id}">${icon("calendar")} ${item.kind === "event" ? "예약 정보" : "영업 정보"}</button>
          <button class="primary-cta" type="button" data-action="save-detail" data-id="${item.id}">${state.saved[item.id] ? icon("check") + " 저장됨" : icon("heart") + " 저장하기"}</button>
        </div>
      </div>
    </div>
  </section>`;
  bindDetailBackGesture();
}

function bindDetailBackGesture() {
  const screen = app.querySelector(".detail-screen");
  if (!screen) return;
  let startX = 0;
  let startY = 0;
  let pointerId = null;

  screen.addEventListener("pointerdown", (event) => {
    if (event.target.closest("textarea")) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
  });
  screen.addEventListener("pointerup", (event) => {
    if (pointerId !== event.pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    pointerId = null;
    if (dx > 80 && Math.abs(dx) > Math.abs(dy)) {
      event.preventDefault();
      state.view = "explore";
      state.activeTab = "explore";
      saveState();
      renderExplore();
    }
  });
}

function expiryFor(item, saved) {
  return item.kind === "event" ? item.eventEnd : saved.visibleUntil ?? addDays(saved.savedAt, 7);
}

function isVisibleSave(item, saved) {
  return new Date(expiryFor(item, saved)).getTime() > Date.now();
}

function expiryLabel(item, saved) {
  const expiry = new Date(expiryFor(item, saved));
  if (item.kind === "event") {
    return `이벤트 종료 ${expiry.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}까지`;
  }
  const days = Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / DAY_MS));
  return `지도에서 ${days}일 더 보여요`;
}

function visibleSavedItems() {
  return Object.entries(state.saved)
    .map(([id, saved]) => ({ item: getOpportunity(id), saved }))
    .filter(({ item, saved }) => isVisibleSave(item, saved));
}

function savedCardMarkup(item, saved) {
  const attended = Boolean(saved.attendedAt);
  const reviewOpen = state.reviewOpenId === item.id;
  return `<article class="saved-card ${state.selectedSavedId === item.id ? "is-selected" : ""}" data-saved-id="${item.id}">
    <button class="saved-select" type="button" data-action="select-saved" data-id="${item.id}" aria-label="${escapeHtml(item.title)} 핀 선택">
      <img src="./assets/${item.images[0]}" alt="">
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

function renderMap() {
  const savedItems = visibleSavedItems();
  if (!savedItems.some(({ item }) => item.id === state.selectedSavedId)) {
    state.selectedSavedId = savedItems[0]?.item.id ?? null;
  }
  bottomNav.classList.add("is-hidden");
  app.innerHTML = `<section class="screen map-screen" data-view="map">
    <header class="map-topbar">
      <button class="round-back" type="button" data-action="back-explore" aria-label="탐색으로 돌아가기">${icon("arrowLeft")}</button>
      <div><small>저장한 경험</small><strong>${savedItems.length}곳</strong></div>
      <button class="round-back" type="button" data-action="open-filter" aria-label="추천 유형 필터">${icon("filter")}</button>
    </header>
    <div class="map-canvas" aria-label="저장한 경험 지도">
      <svg class="map-lines" viewBox="0 0 390 520" aria-hidden="true">
        <path d="M-20 95C72 136 83 44 176 92s134 5 238 64"/>
        <path d="M22 8c40 93 76 115 63 214s61 119 43 310"/>
        <path d="M-12 285c83-35 131-5 184 45s149 40 246-9"/>
        <path d="M225-20c-14 91 36 112 8 195s22 133 108 174"/>
        <path class="river" d="M-30 211c103-39 186 11 242 25s116-15 213-69"/>
      </svg>
      <span class="map-label seoul">SEOUL</span><span class="map-label gyeonggi">GYEONGGI</span>
      ${savedItems.map(({ item }) => `<button class="map-pin ${state.selectedSavedId === item.id ? "is-active" : ""}" style="--x:${item.pin[0]}%;--y:${item.pin[1]}%" type="button" data-action="select-saved" data-id="${item.id}" aria-label="${escapeHtml(item.title)}">${icon("map")}</button>`).join("")}
      <button class="locate-button" type="button" data-action="recenter-map" aria-label="현재 위치">${icon("focus")}</button>
    </div>
    <section class="saved-sheet">
      <div class="sheet-handle"></div>
      ${savedItems.length ? `<div class="saved-rail">${savedItems.map(({ item, saved }) => savedCardMarkup(item, saved)).join("")}</div>` : `<div class="saved-empty"><span>♡</span><h2>저장한 경험이 아직 없어요</h2><p>오른쪽으로 넘긴 경험만 여기에 나타나요.</p></div>`}
    </section>
  </section>`;
}

function renderStatus() {
  stopValueCounter();
  bottomNav.classList.remove("is-hidden");
  app.innerHTML = `<section class="screen status-screen" data-view="status">
    <header class="status-header">
      <div class="avatar">A</div>
      <div><small>오늘의 상태</small><h1>안녕하세요, Daniel</h1></div>
      <span class="status-header-spacer" aria-hidden="true"></span>
    </header>
    <div class="value-counter">
      <div class="value-counter-meta">
        <span data-today-label>${todayLabel()}</span>
        <button type="button" data-action="edit-rate">시급 ₩${(Number(state.hourlyWage) || DEFAULT_HOURLY_WAGE).toLocaleString("ko-KR")}</button>
      </div>
      <strong data-live-value aria-live="off">-₩0</strong>
    </div>
    <div class="status-toolbar">
      <div><small>TODAY</small><strong>내 측정</strong></div>
      <div class="view-toggle" aria-label="상태 보기 방식">
        <button type="button" data-action="status-list" aria-label="목록으로 보기" aria-pressed="${state.statusMode === "list"}">${icon("list")}</button>
        <button type="button" data-action="status-grid" aria-label="그리드로 보기" aria-pressed="${state.statusMode === "grid"}">${icon("grid")}</button>
      </div>
    </div>
    <div class="metrics ${state.statusMode === "list" ? "is-list" : "is-grid"}">
      ${metricData.map((metric) => `<button class="metric-card metric-${metric.key}" type="button" data-action="open-metric" data-key="${metric.key}" aria-label="${metric.label} 상세 보기">
        <span class="metric-card-top"><span class="metric-icon">${icon(metric.icon)}</span><small>${metric.label}</small>${icon("chevronRight", "metric-chevron")}</span>
        <strong>${metric.value}</strong>
        <p>${metric.context}</p>
        <span class="metric-progress" aria-hidden="true"><i style="--metric-progress:${metric.score}%"></i></span>
      </button>`).join("")}
    </div>
  </section>`;
  syncNavigation();
  startValueCounter();
}

function renderMetricDetail(key) {
  stopValueCounter();
  const metric = metricData.find((item) => item.key === key) ?? metricData[0];
  bottomNav.classList.add("is-hidden");
  app.innerHTML = `<section class="screen metric-detail-screen metric-${metric.key}" data-view="metric-detail">
    <header class="metric-detail-topbar">
      <button class="detail-back-button" type="button" data-action="back-status" aria-label="내 측정으로 돌아가기">${icon("arrowLeft")}<span>내 측정</span></button>
      <div><small>오늘</small><strong>${metric.label}</strong></div>
      <span class="metric-topbar-spacer" aria-hidden="true"></span>
    </header>
    <div class="metric-detail-scroll">
      <section class="metric-score-panel" aria-label="${metric.detailLabel} ${metric.score}퍼센트">
        <div class="metric-score-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle class="metric-ring-track" cx="60" cy="60" r="52" pathLength="100"></circle>
            <circle class="metric-ring-value" cx="60" cy="60" r="52" pathLength="100" style="stroke-dashoffset:${100 - metric.score}"></circle>
          </svg>
          <span>${icon(metric.icon)}</span>
          <strong>${metric.score}<i>%</i></strong>
          <small>${metric.detailLabel}</small>
        </div>
        <p>${metric.summary}</p>
      </section>
      <section class="metric-factors" aria-labelledby="metric-factors-title">
        <div class="metric-section-heading"><span id="metric-factors-title">오늘의 구성</span><small>개인 기준과 비교</small></div>
        <div class="metric-factor-card">
          ${metric.factors.map((factor) => `<div class="metric-factor-row">
            <span class="factor-icon">${icon(factor.icon)}</span>
            <span class="factor-copy"><b>${factor.label}</b><i class="factor-meter" aria-hidden="true"><em style="--factor-progress:${factor.percent}%"></em></i></span>
            <strong>${factor.value}</strong>
          </div>`).join("")}
        </div>
      </section>
      <section class="metric-insight-card"><span>오늘의 신호</span><p>${metric.insight}</p></section>
      <section class="metric-history" aria-labelledby="metric-history-title">
        <div class="metric-section-heading"><span id="metric-history-title">7일 추이</span><small>최근 기록</small></div>
        <div class="history-bars" aria-hidden="true">${metric.history.map((value, index) => `<i class="${index === metric.history.length - 1 ? "is-today" : ""}" style="--history:${value}%"><span></span></i>`).join("")}</div>
        <div class="history-labels"><span>금</span><span>토</span><span>일</span><span>월</span><span>화</span><span>수</span><span>오늘</span></div>
      </section>
    </div>
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
      <button type="button" data-action="set-filter" data-filter="all" aria-pressed="${state.filter === "all"}"><span>✦</span><b>전체 경험</b><small>종류를 섞어서 보기</small>${icon("check")}</button>
      <button type="button" data-action="set-filter" data-filter="event" aria-pressed="${state.filter === "event"}"><span>◌</span><b>이벤트</b><small>공연 · 전시 · 클래스 · 스포츠</small>${icon("check")}</button>
      <button type="button" data-action="set-filter" data-filter="place" aria-pressed="${state.filter === "place"}"><span>⌂</span><b>맛집·카페</b><small>지금 갈 수 있는 장소</small>${icon("check")}</button>
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

function renderRateEditor() {
  if (document.querySelector(".sheet-overlay")) return;
  filterReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const overlay = document.createElement("div");
  overlay.className = "sheet-overlay";
  overlay.innerHTML = `<div class="rate-sheet" role="dialog" aria-modal="true" aria-labelledby="rate-title" tabindex="-1">
    <div class="sheet-handle"></div>
    <h2 id="rate-title">시급 수정</h2>
    <label class="rate-input-label" for="hourly-rate-input">시급</label>
    <div class="rate-input-wrap"><span>₩</span><input id="hourly-rate-input" type="number" inputmode="numeric" min="1000" max="10000000" step="1000" required value="${Number(state.hourlyWage) || DEFAULT_HOURLY_WAGE}"></div>
    <div class="rate-sheet-actions">
      <button type="button" data-action="close-sheet">취소</button>
      <button type="button" data-action="save-hourly-rate">저장</button>
    </div>
  </div>`;
  document.querySelector(".phone").append(overlay);
  const sheet = overlay.querySelector(".rate-sheet");
  const input = overlay.querySelector("#hourly-rate-input");
  input.focus();
  input.select();
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    overlay.querySelector('[data-action="save-hourly-rate"]').click();
  });
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSheet();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = [...sheet.querySelectorAll("input, button")];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
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

function syncNavigation() {
  for (const button of bottomNav.querySelectorAll("[data-tab]")) {
    const active = button.dataset.tab === state.activeTab;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }
}

function render() {
  stopValueCounter();
  if (state.view === "detail") renderDetail(state.detailId);
  else if (state.view === "map") renderMap();
  else if (state.view === "metric-detail") renderMetricDetail(state.metricDetailKey);
  else if (state.view === "status") renderStatus();
  else renderExplore();
}

function movePhoto(item, direction) {
  const current = photoIndex(item);
  state.photoIndices[item.id] = (current + direction + item.images.length) % item.images.length;
  saveState();
  render();
}

function passCurrent() {
  const item = currentOpportunity();
  if (!item) return;
  state.decisions[item.id] = "passed";
  recordEvent("passed", item.id);
  animateCard("left", () => {
    showToast("이번 추천은 넘겼어요");
    renderExplore();
  });
}

function saveOpportunity(id, source = "card") {
  const item = getOpportunity(id);
  const savedAt = new Date().toISOString();
  state.saved[id] = {
    savedAt,
    visibleUntil: item.kind === "place" ? addDays(savedAt, 7) : undefined,
    attendedAt: null,
    review: "",
  };
  state.selectedSavedId = id;
  recordEvent("saved", id, { source, visibilityRule: item.kind === "event" ? "event_end" : "seven_days" });
}

function saveCurrent() {
  const item = currentOpportunity();
  if (!item) return;
  saveOpportunity(item.id, "swipe");
  animateCard("right", () => {
    showToast(item.kind === "event" ? "이벤트 종료일까지 지도에 저장했어요" : "7일 동안 지도에 저장했어요");
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
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!dragging && Math.hypot(dx, dy) < 8) return;
    if (!dragging) {
      dragging = true;
      card.setPointerCapture(pointerId);
      card.classList.add("is-dragging");
    }
    card.style.transform = `translateX(${dx}px) rotate(${dx / 22}deg)`;
    card.style.setProperty("--decision-opacity", String(Math.min(1, Math.abs(dx) / 90)));
    card.dataset.direction = dx >= 0 ? "save" : "pass";
  });

  const finish = (event) => {
    if (pointerId !== event.pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    pointerId = null;
    card.classList.remove("is-dragging");
    if (card.hasPointerCapture?.(event.pointerId)) card.releasePointerCapture(event.pointerId);
    if (dragging && Math.abs(dx) > 72 && Math.abs(dx) > Math.abs(dy)) {
      event.preventDefault();
      if (dx > 0) saveCurrent();
      else passCurrent();
      return;
    }
    card.style.transform = "";
    card.style.removeProperty("--decision-opacity");
    delete card.dataset.direction;
    if (dragging && dy < -48 && Math.abs(dy) > Math.abs(dx)) {
      event.preventDefault();
      const item = currentOpportunity();
      if (item) {
        state.view = "detail";
        state.detailId = item.id;
        saveState();
        renderDetail(item.id);
      }
    }
  };

  card.addEventListener("pointerup", finish);
  card.addEventListener("pointercancel", finish);
}

document.querySelector(".phone").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id ?? currentOpportunity()?.id;

  if (action === "prev-photo" && id) movePhoto(getOpportunity(id), -1);
  else if (action === "next-photo" && id) movePhoto(getOpportunity(id), 1);
  else if (action === "pass") passCurrent();
  else if (action === "save") saveCurrent();
  else if (action === "open-detail" && id) {
    state.view = "detail";
    state.detailId = id;
    saveState();
    renderDetail(id);
  } else if (action === "back-explore") {
    state.view = "explore";
    state.activeTab = "explore";
    saveState();
    renderExplore();
  } else if (action === "open-map") {
    state.view = "map";
    recordEvent("map_opened", state.selectedSavedId, { visibleCount: visibleSavedItems().length });
    renderMap();
  } else if (action === "open-filter") renderFilter();
  else if (action === "close-sheet") closeSheet();
  else if (action === "set-filter") {
    state.filter = button.dataset.filter;
    state.view = "explore";
    saveState();
    closeSheet();
    renderExplore();
  } else if (action === "save-detail" && id) {
    if (!state.saved[id]) saveOpportunity(id, "detail");
    showToast(getOpportunity(id).kind === "event" ? "종료일까지 지도에 저장했어요" : "7일 동안 지도에 저장했어요");
    renderDetail(id);
  } else if (action === "route" && id) {
    recordEvent("route_opened", id);
    showToast("실제 제품에서는 지도 앱으로 연결됩니다");
  } else if (action === "booking-info" && id) {
    recordEvent("booking_info_opened", id);
    showToast(getOpportunity(id).kind === "event" ? "예약 정보는 다음 단계에서 연결됩니다" : "영업 정보는 다음 단계에서 연결됩니다");
  } else if (action === "detail-more") {
    showToast("추가 메뉴는 다음 단계에서 연결됩니다");
  } else if (action === "edit-rate") {
    renderRateEditor();
  } else if (action === "save-hourly-rate") {
    const input = document.querySelector("#hourly-rate-input");
    if (!input?.checkValidity()) {
      input?.reportValidity();
      return;
    }
    state.hourlyWage = Math.round(input.valueAsNumber);
    recordEvent("hourly_rate_changed", null, { hourlyWage: state.hourlyWage });
    closeSheet();
    renderStatus();
  } else if (action === "open-metric") {
    state.view = "metric-detail";
    state.metricDetailKey = button.dataset.key;
    saveState();
    renderMetricDetail(state.metricDetailKey);
  } else if (action === "back-status") {
    state.view = "status";
    state.activeTab = "status";
    saveState();
    renderStatus();
  } else if (action === "recenter-map") {
    showToast("현재 위치로 지도를 맞췄어요");
  } else if (action === "select-saved" && id) {
    state.selectedSavedId = id;
    saveState();
    renderMap();
    requestAnimationFrame(() => document.querySelector(`[data-saved-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }));
  } else if (action === "extend" && id) {
    const saved = state.saved[id];
    saved.visibleUntil = addDays(expiryFor(getOpportunity(id), saved), 7);
    recordEvent("extended", id, { days: 7, visibleUntil: saved.visibleUntil });
    showToast("지도 표시를 7일 연장했어요");
    renderMap();
  } else if (action === "attend" && id) {
    state.saved[id].attendedAt = new Date().toISOString();
    recordEvent("attended", id);
    showToast("다녀온 경험으로 기록했어요");
    renderMap();
  } else if (action === "open-review" && id) {
    state.reviewOpenId = id;
    saveState();
    renderMap();
    document.querySelector(`#review-${CSS.escape(id)}`)?.focus();
  } else if (action === "save-review" && id) {
    const field = document.querySelector(`#review-${CSS.escape(id)}`);
    const review = field?.value.trim() ?? "";
    if (!review) {
      showToast("남기고 싶은 내용이 있을 때만 적어주세요");
      return;
    }
    state.saved[id].review = review;
    state.reviewOpenId = null;
    recordEvent("reviewed", id, { text: review });
    showToast("후기를 저장했어요");
    renderMap();
  } else if (action === "status-list" || action === "status-grid") {
    state.statusMode = action === "status-list" ? "list" : "grid";
    recordEvent("status_view_changed", null, { mode: state.statusMode });
    renderStatus();
  } else if (action === "reset-deck") {
    state.decisions = {};
    recordEvent("deck_reset");
    renderExplore();
  }
});

bottomNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  state.activeTab = button.dataset.tab;
  state.view = state.activeTab === "status" ? "status" : "explore";
  saveState();
  render();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (document.querySelector(".sheet-overlay")) closeSheet();
  else if (state.view === "metric-detail") {
    state.view = "status";
    state.activeTab = "status";
    saveState();
    renderStatus();
  } else if (state.view === "detail" || state.view === "map") {
    state.view = "explore";
    state.activeTab = "explore";
    saveState();
    renderExplore();
  }
});

render();
