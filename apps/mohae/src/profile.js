import { escapeHtml, icon } from "./core.js";

export function createProfileFeature(context) {
  function render() {
    const displayName = context.state.profile.displayName || "게스트";
    const initial = displayName === "게스트" ? "M" : displayName.slice(0, 1).toUpperCase();
    context.bottomNav.classList.remove("is-hidden");
    context.app.innerHTML = `<section class="screen profile-screen" data-view="profile">
      <header class="profile-header">
        <div class="avatar">${escapeHtml(initial)}</div>
        <div><small>MY MOHAE</small><h1>${escapeHtml(displayName)}</h1></div>
      </header>

      <section class="account-card">
        <span class="account-card-icon">${icon("user")}</span>
        <div><h2>내 지도를 이어서 사용하세요</h2><p>로그인하면 저장한 경험, 계획 장소, 추천 기록을 다른 기기에서도 이어볼 수 있어요.</p></div>
        <button type="button" data-action="start-sign-in">${icon("login")} 로그인</button>
      </section>

      <section class="profile-section" aria-labelledby="profile-settings-title">
        <div class="profile-section-heading"><small>PROFILE</small><h2 id="profile-settings-title">기본 설정</h2></div>
        <div class="profile-list">
          <button type="button" data-action="profile-language"><span class="profile-row-icon">${icon("globe")}</span><span><b>언어</b><small>${escapeHtml(context.state.profile.locale === "en" ? "English" : "한국어")}</small></span>${icon("chevronRight")}</button>
          <button type="button" data-action="profile-region"><span class="profile-row-icon">${icon("map")}</span><span><b>기본 지역</b><small>${escapeHtml(context.state.profile.homeRegion || "아직 설정하지 않음")}</small></span>${icon("chevronRight")}</button>
          <button type="button" data-action="profile-privacy"><span class="profile-row-icon">${icon("shield")}</span><span><b>개인정보</b><small>지도와 활동 기록은 비공개</small></span>${icon("chevronRight")}</button>
        </div>
      </section>
    </section>`;
    context.syncNavigation();
  }

  function handleAction(button) {
    const action = button.dataset.action;
    if (action === "start-sign-in") {
      context.recordEvent("sign_in_opened");
      context.showToast("로그인 제공자는 아직 연결되지 않았어요");
    } else if (action === "profile-language") {
      context.showToast("한국어·English 전환은 다음 단계에서 연결됩니다");
    } else if (action === "profile-region") {
      context.showToast("기본 지역 설정은 다음 단계에서 연결됩니다");
    } else if (action === "profile-privacy") {
      context.showToast("개인정보 설정은 로그인과 함께 연결됩니다");
    } else return false;
    return true;
  }

  return { handleAction, render };
}
