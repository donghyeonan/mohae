// ponytail: audited 2026-09-02 snapshot; move to data-owned canonicalPlaceId only when another runtime surface needs it.
const IDENTITY_GROUPS = [
  ["hidden:1302703569", "michelin:570665"], // 온지음
  ["hidden:1308147363", "michelin:1243505"], // 그랑디르
  ["hidden:1704712793", "michelin:1207561"], // 빈호
  ["hidden:1881172296", "michelin:1213126"], // 면서울
  ["hidden:37020894", "michelin:511972"], // 권숙수
  ["hidden:11679381", "michelin:512038"], // 우래옥
  ["hidden:38781115", "michelin:548152"], // 익스퀴진
  ["hidden:13320884", "michelin:511965"], // 정식당
  ["hidden:1971122149", "michelin:1201705"], // 솔밤
  ["hidden:35215752", "michelin:511985"], // 밍글스
  ["hidden:11679429", "michelin:511954"], // 황생가 칼국수
  ["hidden:37402189", "michelin:511973"], // 라연
  ["hidden:33979993", "michelin:512018"], // 스와니예
];
const CANONICAL_ID = new Map(IDENTITY_GROUPS.flatMap((group) => group.map((id) => [id, group[0]])));
const TERMINAL_COLLISION_GROUPS = [
  ["michelin:1192575", "michelin:1194866"], // 소울 · 에그 앤 플라워
];
const TERMINAL_COLLISION_ID = new Map(TERMINAL_COLLISION_GROUPS.flatMap((group) => group.map((id) => [id, group[0]])));
const TERMINAL_COLLISION_ZOOM = 19;
const COORDINATE_COLLISION_PRECISION = 6;

function sourceRank(place) {
  return place.source === "hidden_archive" ? 0 : place.source === "michelin_2026" ? 1 : 2;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

export function canonicalizeMapPlaces(places) {
  const groups = new Map();
  for (const place of places) {
    const key = CANONICAL_ID.get(place.id) ?? place.id;
    const group = groups.get(key) ?? [];
    group.push(place);
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    const ordered = [...group].sort((a, b) => sourceRank(a) - sourceRank(b));
    const primary = ordered[0];
    return {
      ...primary,
      sourceIds: ordered.map(({ id }) => id),
      sources: ordered.map(({ id, source, sourceLabel, placeUrl, signal }) => ({ id, source, sourceLabel, placeUrl, signal })),
      sourceLabels: unique(ordered.map(({ sourceLabel }) => sourceLabel)),
      categories: unique(ordered.flatMap(({ categories }) => categories ?? [])),
      collectionLabels: unique(ordered.flatMap(({ collectionLabels }) => collectionLabels ?? [])),
      areaSearchText: unique(ordered.flatMap((place) => [place.name, place.address, place.location, place.areaSearchText])).join(" "),
      localizationSearchText: unique(ordered.flatMap((place) => [place.name, place.address, place.localizationSearchText])).join(" "),
    };
  });
}

function coordinateCollisionKey(place) {
  return `${Number(place.latitude).toFixed(COORDINATE_COLLISION_PRECISION)}:${Number(place.longitude).toFixed(COORDINATE_COLLISION_PRECISION)}`;
}

function groupExactCoordinates(places) {
  const groups = new Map();
  for (const place of places) {
    const key = coordinateCollisionKey(place);
    const group = groups.get(key) ?? [];
    group.push(place);
    groups.set(key, group);
  }
  return [...groups.values()];
}

function hasExactCoordinateCollision(group) {
  return group.length > 1 && new Set(group.map(coordinateCollisionKey)).size === 1;
}

function mergeTerminalGroups(inputGroups) {
  const groups = [];
  for (const input of inputGroups) {
    const collisionIds = new Set(input.map(({ id }) => TERMINAL_COLLISION_ID.get(id)).filter(Boolean));
    const matching = groups.filter((group) => group.some(({ id }) => collisionIds.has(TERMINAL_COLLISION_ID.get(id))));
    if (!matching.length) {
      groups.push([...input]);
      continue;
    }
    const merged = [...matching.flat(), ...input];
    for (const group of matching) groups.splice(groups.indexOf(group), 1);
    groups.push(merged);
  }
  return groups;
}

export function mapPlaceGroups(places, zoom) {
  if (zoom >= TERMINAL_COLLISION_ZOOM) {
    return mergeTerminalGroups(groupExactCoordinates(places)).map((group) => ({
      places: [...group].sort((a, b) => sourceRank(a) - sourceRank(b)),
      terminalCollision: group.length > 1 && (hasExactCoordinateCollision(group) || Boolean(TERMINAL_COLLISION_ID.get(group[0].id))),
    }));
  }

  const cellSize = 0.22 / (2 ** Math.max(0, zoom - 7));
  const groups = new Map();
  for (const place of places) {
    const key = `${place.type}:${Math.floor(place.latitude / cellSize)}:${Math.floor(place.longitude / cellSize)}`;
    const group = groups.get(key) ?? [];
    group.push(place);
    groups.set(key, group);
  }
  return mergeTerminalGroups([...groups.values()]).map((group) => ({
    places: group,
    terminalCollision: hasExactCoordinateCollision(group) || Boolean(TERMINAL_COLLISION_ID.get(group[0]?.id)),
  }));
}
