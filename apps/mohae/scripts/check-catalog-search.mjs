import assert from "node:assert/strict";
import { searchCatalogPlaces } from "../src/catalog-search.js";

const places = [
  { id: "restaurant", name: "성수 식당", subtype: "restaurant", type: "restaurant", areaSearchText: "성수 서울 성동구", latitude: 37.544, longitude: 127.056 },
  { id: "bar", name: "성수 바", subtype: "bar", type: "restaurant", areaSearchText: "성수 서울 성동구", latitude: 37.545, longitude: 127.057 },
  { id: "busan", name: "해운대 식당", subtype: "restaurant", type: "restaurant", areaSearchText: "해운대 부산", localizationSearchText: "성수에서 유명한 스타일의 식당", latitude: 35.16, longitude: 129.16 },
];

const exactRestaurant = searchCatalogPlaces(places, { area: "성수", categories: ["restaurant"], limit: 20 });
assert.deepEqual(exactRestaurant.matches.map(({ place }) => place.id), ["restaurant"]);

const foodSubtypes = searchCatalogPlaces(places, { area: "성수", categories: ["restaurant", "bar"], limit: 20 });
assert.deepEqual(foodSubtypes.matches.map(({ place }) => place.id), ["restaurant", "bar"]);

const nearby = searchCatalogPlaces(places, { latitude: 37.544, longitude: 127.056, radiusKm: 1, limit: 20 });
assert.deepEqual(nearby.matches.map(({ place }) => place.id), ["restaurant", "bar"]);
assert.equal(nearby.matches[0].distanceKm, 0);

assert.throws(
  () => searchCatalogPlaces(places, { useCurrentLocation: true }, null),
  /LOCATION_NOT_GRANTED/,
);

console.log(JSON.stringify({ exactRestaurant: exactRestaurant.matches.length, foodSubtypes: foodSubtypes.matches.length, status: "ok" }));
