import { createId, escapeHtml, icon } from "./core.js";

const ROOM_HASH_KEY = "trip";
const POLL_INTERVAL_MS = 5000;
const MAX_NOTE_LENGTH = 600;

function cleanText(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function tripTokenFromLocation() {
  return new URLSearchParams(window.location.hash.replace(/^#/, "")).get(ROOM_HASH_KEY) ?? "";
}

function memberStorageKey(roomToken) {
  return `mohae-trip-member:${roomToken}`;
}

function latestChoices(snapshot, memberId, sceneRevision = snapshot?.room?.sceneRevision) {
  const choices = new Map();
  for (const event of snapshot?.events ?? []) {
    if (event.type !== "choice" || event.memberId !== memberId) continue;
    if (Number(event.payload?.sceneRevision) !== Number(sceneRevision)) continue;
    const placeId = cleanText(event.payload?.placeId, 180);
    if (placeId) choices.set(placeId, event);
  }
  return choices;
}

export function summarizeTripSnapshot(snapshot) {
  if (!snapshot?.room) throw new Error("Shared trip room is unavailable.");
  const sceneRevision = snapshot.room.sceneRevision;
  const candidates = (snapshot.room.scene?.candidates ?? []).map((candidate, index) => ({
    order: index + 1,
    placeId: candidate.id,
    catalogId: candidate.catalogId ?? null,
    title: candidate.title,
    location: candidate.location,
    address: candidate.address,
    latitude: candidate.latitude ?? null,
    longitude: candidate.longitude ?? null,
    reason: candidate.reason ?? candidate.subtitle ?? "",
    origin: candidate.origin ?? "catalog",
  }));
  const candidateById = new Map(candidates.map((candidate) => [candidate.placeId, candidate]));
  const members = (snapshot.members ?? []).map((member) => {
    const choices = [...latestChoices(snapshot, member.id, sceneRevision).values()].map((event) => ({
      placeId: event.payload.placeId,
      placeTitle: event.payload.placeTitle || candidateById.get(event.payload.placeId)?.title || "",
      decision: event.payload.decision,
      surface: event.payload.surface,
      recordedAt: event.createdAt,
    }));
    const notes = (snapshot.events ?? [])
      .filter((event) => event.type === "note" && event.memberId === member.id)
      .map((event) => ({
        text: event.payload.text,
        referencedPlaceIds: event.payload.referencedPlaceIds ?? [],
        sceneRevision: event.payload.sceneRevision,
        recordedAt: event.createdAt,
      }));
    return {
      memberId: member.id,
      displayName: member.displayName,
      role: member.role,
      ready: member.ready,
      choices,
      notes,
    };
  });
  const savedByPlace = candidates.map((candidate) => {
    const savedBy = members.filter((member) => member.choices.some((choice) => choice.placeId === candidate.placeId && choice.decision === "saved"));
    const passedBy = members.filter((member) => member.choices.some((choice) => choice.placeId === candidate.placeId && choice.decision === "passed"));
    return {
      placeId: candidate.placeId,
      title: candidate.title,
      savedBy: savedBy.map(({ displayName }) => displayName),
      passedBy: passedBy.map(({ displayName }) => displayName),
    };
  }).filter(({ savedBy, passedBy }) => savedBy.length || passedBy.length);
  return {
    room: {
      title: snapshot.room.title,
      stage: snapshot.room.stage,
      sceneRevision,
      memberCount: members.length,
      readyCount: members.filter(({ ready }) => ready).length,
      expiresAt: snapshot.room.expiresAt,
    },
    scene: {
      title: snapshot.room.scene?.title ?? snapshot.room.title,
      contextLabel: snapshot.room.scene?.contextLabel ?? "",
      anchors: snapshot.room.scene?.anchors ?? [],
      candidates,
    },
    members,
    placeSignals: savedByPlace,
  };
}

export function createGroupTripFeature(context) {
  let roomToken = tripTokenFromLocation();
  let membership = loadMembership(roomToken);
  let snapshot = null;
  let busy = false;
  let syncError = "";
  let panelOpen = false;
  let pollTimer = null;
  let appliedSceneRevision = null;

  function loadMembership(token) {
    if (!token) return null;
    try {
      const value = JSON.parse(localStorage.getItem(memberStorageKey(token)) ?? "null");
      if (!value?.memberToken || !value?.memberId) return null;
      return value;
    } catch {
      return null;
    }
  }

  function saveMembership(value) {
    membership = value;
    if (roomToken && value) localStorage.setItem(memberStorageKey(roomToken), JSON.stringify(value));
  }

  async function rpc(name, body) {
    await (window.__MOHAE_CONFIG_READY__ ?? Promise.resolve(window.__MOHAE_CONFIG__));
    const { supabaseUrl, supabasePublishableKey } = window.__MOHAE_CONFIG__ ?? {};
    if (!supabaseUrl || !supabasePublishableKey) throw new Error("Supabase public config missing.");
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        apikey: supabasePublishableKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) {
      let message = `Shared trip request failed: ${response.status}`;
      try {
        const error = await response.json();
        if (error?.message) message = error.message;
      } catch {
        // Keep the status-only message when PostgREST returns no JSON body.
      }
      throw new Error(message);
    }
    return response.json();
  }

  function inviteUrl() {
    const url = new URL(window.location.href);
    url.hash = new URLSearchParams({ [ROOM_HASH_KEY]: roomToken }).toString();
    return url.href;
  }

  function applyRoomScene(nextSnapshot, force = false) {
    const room = nextSnapshot?.room;
    if (!room?.scene?.candidates?.length) return false;
    if (!force && appliedSceneRevision === room.sceneRevision) return false;
    context.state.activeExploration = room.scene;
    context.state.activeCollectionId = null;
    context.state.activeTab = "explore";
    context.state.view = "explore";
    appliedSceneRevision = room.sceneRevision;
    context.saveState();
    return true;
  }

  function applySnapshot(nextSnapshot, { forceScene = false, render = false } = {}) {
    if (!nextSnapshot?.room) throw new Error("Shared trip room response is invalid.");
    const previousMembers = JSON.stringify((snapshot?.members ?? []).map(({ id, ready }) => [id, ready]));
    snapshot = nextSnapshot;
    if (nextSnapshot.currentMemberId && membership) {
      saveMembership({ ...membership, memberId: nextSnapshot.currentMemberId });
    }
    const sceneChanged = applyRoomScene(nextSnapshot, forceScene);
    const membersChanged = previousMembers !== JSON.stringify((snapshot.members ?? []).map(({ id, ready }) => [id, ready]));
    syncError = "";
    if (render || sceneChanged || membersChanged) context.render();
    if (panelOpen && membership && membersChanged) renderPanel();
  }

  async function refresh({ forceScene = false, render = false } = {}) {
    if (!roomToken) return null;
    try {
      const nextSnapshot = await rpc("mohae_get_trip_room", { p_room_token: roomToken });
      applySnapshot(nextSnapshot, { forceScene, render });
      return nextSnapshot;
    } catch (error) {
      syncError = error instanceof Error ? error.message : "공유방을 불러오지 못했어요.";
      if (render) context.render();
      throw error;
    }
  }

  function startPolling() {
    clearInterval(pollTimer);
    if (!roomToken) return;
    pollTimer = setInterval(() => {
      if (document.visibilityState === "hidden" || busy) return;
      void refresh().catch(() => {});
    }, POLL_INTERVAL_MS);
  }

  async function initialize() {
    if (!roomToken) return;
    try {
      await refresh({ forceScene: true });
      context.render();
      if (!membership) openPanel();
      startPolling();
    } catch {
      context.render();
      openPanel();
    }
  }

  function currentMember() {
    return (snapshot?.members ?? []).find(({ id }) => id === membership?.memberId) ?? null;
  }

  function isJoined() {
    return Boolean(roomToken && snapshot?.room && membership?.memberId && currentMember());
  }

  function isHost() {
    return currentMember()?.role === "host";
  }

  function choiceFor(placeId) {
    if (!isJoined()) return null;
    return latestChoices(snapshot, membership.memberId).get(placeId)?.payload?.decision ?? null;
  }

  function roomButtonMarkup() {
    const memberCount = snapshot?.members?.length ?? 0;
    const label = isJoined() ? `${memberCount}명이 함께 고르는 중` : roomToken ? "여행방 참여" : "같이 고르기";
    return `<button class="square-button group-room-button${roomToken ? " is-active" : ""}" type="button" data-group-action="open-room" aria-label="${escapeHtml(label)}">${icon("users")}${memberCount ? `<b>${memberCount}</b>` : ""}</button>`;
  }

  function roomBannerMarkup() {
    if (!isJoined()) return "";
    const member = currentMember();
    const readyCount = snapshot.members.filter(({ ready }) => ready).length;
    return `<button class="group-room-strip" type="button" data-group-action="open-room">
      <span class="group-room-avatars">${snapshot.members.slice(0, 4).map(({ displayName, ready }) => `<i class="${ready ? "is-ready" : ""}">${escapeHtml(displayName.slice(0, 1))}</i>`).join("")}</span>
      <span><strong>${escapeHtml(member.displayName)} 선택 중</strong><small>${readyCount}/${snapshot.members.length}명 선택 완료</small></span>
      ${icon("chevronRight")}
    </button>`;
  }

  function closePanel() {
    panelOpen = false;
    document.querySelector(".group-trip-overlay")?.remove();
  }

  function memberRowsMarkup() {
    return (snapshot?.members ?? []).map((member) => `<li${member.id === membership?.memberId ? ' class="is-me"' : ""}>
      <span>${escapeHtml(member.displayName.slice(0, 1))}</span>
      <b>${escapeHtml(member.displayName)}${member.role === "host" ? " · 방장" : ""}</b>
      <small>${member.ready ? "선택 완료" : "선택 중"}</small>
    </li>`).join("");
  }

  function renderPanel() {
    document.querySelector(".group-trip-overlay")?.remove();
    if (!panelOpen) return;
    const overlay = document.createElement("div");
    overlay.className = "sheet-overlay group-trip-overlay";
    const member = currentMember();
    const scene = context.state.activeExploration;
    let body;
    if (syncError && !snapshot?.room) {
      body = `<div class="group-trip-error"><strong>여행방을 열지 못했어요</strong><p>${escapeHtml(syncError)}</p><button type="button" data-group-action="leave-room">링크 닫기</button></div>`;
    } else if (!roomToken) {
      body = `<label class="group-trip-name"><span>내 이름</span><input id="groupTripName" maxlength="40" autocomplete="name" placeholder="예: 민지" value="${escapeHtml(context.state.profile.displayName || "")}"></label>
        <p class="group-trip-help">현재 Agent 후보를 같은 링크로 공유하고 각자의 저장·pass를 따로 모읍니다.</p>
        <button class="group-trip-primary" type="button" data-group-action="create-room"${!scene?.candidates?.length || busy ? " disabled" : ""}>${busy ? "만드는 중…" : "초대 링크 만들기"}</button>
        ${!scene?.candidates?.length ? '<p class="group-trip-warning">먼저 Agent에게 여행 후보를 받아주세요.</p>' : ""}`;
    } else if (!isJoined()) {
      body = `<div class="group-trip-invite-summary"><span>초대받은 여행</span><strong>${escapeHtml(snapshot?.room?.title ?? "함께 고르는 여행")}</strong><small>${snapshot?.members?.length ?? 0}명 참여 중</small></div>
        <label class="group-trip-name"><span>내 이름</span><input id="groupTripName" maxlength="40" autocomplete="name" placeholder="예: 현수"></label>
        <button class="group-trip-primary" type="button" data-group-action="join-room"${busy ? " disabled" : ""}>${busy ? "참여 중…" : "이 여행에 참여"}</button>`;
    } else {
      body = `<div class="group-trip-invite-summary"><span>함께 고르는 여행</span><strong>${escapeHtml(snapshot.room.title)}</strong><small>선택과 Agent에게 말한 조건이 이 방에 모여요.</small></div>
        <ul class="group-trip-members">${memberRowsMarkup()}</ul>
        <button class="group-trip-copy" type="button" data-group-action="copy-link">${icon("users")} 초대 링크 복사</button>
        <button class="group-trip-primary${member?.ready ? " is-ready" : ""}" type="button" data-group-action="toggle-ready"${busy ? " disabled" : ""}>${member?.ready ? `${icon("check")} 선택 완료됨` : "내 선택 완료"}</button>
        <p class="group-trip-help">자연어 조건은 이 페이지를 연 Agent에게 말하면 방에 원문으로 기록됩니다.</p>
        <div class="group-trip-secondary-actions"><button type="button" data-group-action="refresh-room">새로고침</button><button type="button" data-group-action="leave-room">방 나가기</button></div>`;
    }
    overlay.innerHTML = `<div class="group-trip-sheet" role="dialog" aria-modal="true" aria-labelledby="groupTripTitle">
      <div class="sheet-handle"></div>
      <header><span><small>SHARED TRIP</small><h2 id="groupTripTitle">${roomToken ? "여행방" : "같이 고르기"}</h2></span><button type="button" data-group-action="close-room" aria-label="닫기">${icon("x")}</button></header>
      ${body}
    </div>`;
    document.querySelector(".phone")?.append(overlay);
    overlay.querySelector("input")?.focus();
  }

  function openPanel() {
    panelOpen = true;
    renderPanel();
  }

  async function createRoom() {
    const name = cleanText(document.querySelector("#groupTripName")?.value, 40);
    const scene = context.state.activeExploration;
    if (!name) {
      context.showToast("이름을 입력해 주세요");
      return;
    }
    if (!scene?.candidates?.length) {
      context.showToast("먼저 Agent에게 후보를 받아주세요");
      return;
    }
    busy = true;
    renderPanel();
    const nextRoomToken = createId("room");
    const memberToken = createId("member");
    try {
      const nextSnapshot = await rpc("mohae_create_trip_room", {
        p_room_token: nextRoomToken,
        p_member_token: memberToken,
        p_display_name: name,
        p_title: scene.title,
        p_scene: scene,
      });
      roomToken = nextRoomToken;
      saveMembership({ memberToken, memberId: nextSnapshot.currentMemberId, displayName: name });
      const url = new URL(window.location.href);
      url.hash = new URLSearchParams({ [ROOM_HASH_KEY]: roomToken }).toString();
      window.history.replaceState(null, "", url);
      applySnapshot(nextSnapshot);
      startPolling();
      context.recordEvent("group_trip_created", null, { roomId: nextSnapshot.room.id });
      context.showToast("초대 링크를 만들었어요");
    } catch (error) {
      syncError = error instanceof Error ? error.message : "초대 링크를 만들지 못했어요.";
      context.showToast("초대 링크를 만들지 못했어요");
    } finally {
      busy = false;
      context.render();
      renderPanel();
    }
  }

  async function joinRoom() {
    const name = cleanText(document.querySelector("#groupTripName")?.value, 40);
    if (!name) {
      context.showToast("이름을 입력해 주세요");
      return;
    }
    busy = true;
    renderPanel();
    const memberToken = createId("member");
    try {
      const nextSnapshot = await rpc("mohae_join_trip_room", {
        p_room_token: roomToken,
        p_member_token: memberToken,
        p_display_name: name,
      });
      saveMembership({ memberToken, memberId: nextSnapshot.currentMemberId, displayName: name });
      applySnapshot(nextSnapshot, { forceScene: true });
      context.recordEvent("group_trip_joined", null, { roomId: nextSnapshot.room.id });
      context.showToast(`${name}님으로 참여했어요`);
    } catch (error) {
      syncError = error instanceof Error ? error.message : "여행방에 참여하지 못했어요.";
      context.showToast("여행방에 참여하지 못했어요");
    } finally {
      busy = false;
      context.render();
      renderPanel();
    }
  }

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl());
      context.showToast("초대 링크를 복사했어요");
    } catch {
      window.prompt("초대 링크를 복사해 주세요", inviteUrl());
    }
  }

  async function toggleReady() {
    const member = currentMember();
    if (!member || busy) return;
    busy = true;
    renderPanel();
    try {
      const nextSnapshot = await rpc("mohae_set_trip_ready", {
        p_room_token: roomToken,
        p_member_token: membership.memberToken,
        p_ready: !member.ready,
      });
      applySnapshot(nextSnapshot);
      context.recordEvent("group_trip_ready_changed", null, { ready: !member.ready });
    } catch {
      context.showToast("완료 상태를 바꾸지 못했어요");
    } finally {
      busy = false;
      context.render();
      renderPanel();
    }
  }

  function leaveRoom() {
    if (roomToken) localStorage.removeItem(memberStorageKey(roomToken));
    clearInterval(pollTimer);
    roomToken = "";
    membership = null;
    snapshot = null;
    appliedSceneRevision = null;
    syncError = "";
    panelOpen = false;
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url);
    context.state.activeExploration = null;
    context.saveState();
    closePanel();
    context.render();
  }

  async function recordChoice({ placeId, placeTitle, decision, surface }) {
    if (!isJoined()) return null;
    const cleanId = cleanText(placeId, 180);
    const cleanTitle = cleanText(placeTitle, 160);
    if (!cleanId || !cleanTitle || !["saved", "passed"].includes(decision)) throw new Error("Invalid shared trip choice.");
    const optimisticEvent = {
      id: createId("local-choice"),
      memberId: membership.memberId,
      type: "choice",
      payload: { placeId: cleanId, placeTitle: cleanTitle, decision, surface, sceneRevision: snapshot.room.sceneRevision },
      createdAt: new Date().toISOString(),
    };
    snapshot = { ...snapshot, events: [...snapshot.events, optimisticEvent] };
    try {
      const nextSnapshot = await rpc("mohae_record_trip_choice", {
        p_room_token: roomToken,
        p_member_token: membership.memberToken,
        p_place_id: cleanId,
        p_place_title: cleanTitle,
        p_decision: decision,
        p_surface: surface,
      });
      applySnapshot(nextSnapshot);
      return { recorded: true, decision, placeId: cleanId };
    } catch (error) {
      snapshot = { ...snapshot, events: snapshot.events.filter(({ id }) => id !== optimisticEvent.id) };
      syncError = error instanceof Error ? error.message : "선택을 공유하지 못했어요.";
      context.showToast("선택을 공유방에 기록하지 못했어요");
      throw error;
    }
  }

  async function addNote({ text, referencedPlaceIds = [] }) {
    if (!isJoined()) throw new Error("Join a shared trip room before adding a note.");
    const note = cleanText(text, MAX_NOTE_LENGTH);
    const references = [...new Set(referencedPlaceIds.map((value) => cleanText(value, 180)).filter(Boolean))].slice(0, 20);
    if (!note) throw new Error("text is required.");
    const nextSnapshot = await rpc("mohae_add_trip_note", {
      p_room_token: roomToken,
      p_member_token: membership.memberToken,
      p_text: note,
      p_referenced_place_ids: references,
    });
    applySnapshot(nextSnapshot, { render: true });
    context.showToast("여행 조건을 공유방에 남겼어요");
    return {
      recorded: true,
      member: currentMember()?.displayName,
      text: note,
      referencedPlaceIds: references,
      roomReady: snapshot.members.every(({ ready }) => ready),
    };
  }

  async function getContext() {
    if (!roomToken) throw new Error("Open a shared trip invite link first.");
    await refresh();
    return summarizeTripSnapshot(snapshot);
  }

  async function publishScene(scene) {
    if (!isHost()) return null;
    const nextSnapshot = await rpc("mohae_publish_trip_scene", {
      p_room_token: roomToken,
      p_member_token: membership.memberToken,
      p_scene: scene,
    });
    applySnapshot(nextSnapshot);
    return { shared: true, roomTitle: snapshot.room.title, sceneRevision: snapshot.room.sceneRevision };
  }

  function handleAction(button) {
    const action = button.dataset.groupAction;
    if (!action) return false;
    if (action === "open-room") openPanel();
    else if (action === "close-room") closePanel();
    else if (action === "create-room") void createRoom();
    else if (action === "join-room") void joinRoom();
    else if (action === "copy-link") void copyInviteLink();
    else if (action === "toggle-ready") void toggleReady();
    else if (action === "refresh-room") void refresh({ render: true }).then(renderPanel).catch(renderPanel);
    else if (action === "leave-room") leaveRoom();
    else return false;
    return true;
  }

  return {
    addNote,
    bannerMarkup: roomBannerMarkup,
    choiceFor,
    getContext,
    handleAction,
    headerButtonMarkup: roomButtonMarkup,
    initialize,
    get isActive() { return isJoined(); },
    get isHost() { return isHost(); },
    publishScene,
    recordChoice,
  };
}
