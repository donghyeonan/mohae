export function catalogAreaSearchText(record) {
  const localized = Object.values(record.localizations ?? {})
    .flatMap((entry) => [entry.name, entry.address, entry.location]);
  return [record.name, record.address, record.location, ...localized]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
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

export function searchCatalogPlaces(places, input = {}, currentLocation = null) {
  const area = String(input.area ?? "").trim().toLowerCase();
  const categories = new Set(Array.isArray(input.categories) ? input.categories : []);
  const useCurrentLocation = input.useCurrentLocation === true;
  const latitude = useCurrentLocation ? currentLocation?.latitude : input.latitude;
  const longitude = useCurrentLocation ? currentLocation?.longitude : input.longitude;
  if (useCurrentLocation && (!Number.isFinite(latitude) || !Number.isFinite(longitude))) {
    throw new Error("LOCATION_NOT_GRANTED: use the visible MOHAE location button first.");
  }
  if ((latitude === undefined || latitude === null) !== (longitude === undefined || longitude === null)) {
    throw new Error("latitude and longitude must be provided together.");
  }
  const center = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    ? { latitude: Number(latitude), longitude: Number(longitude) }
    : null;
  const radiusKm = Math.min(100, Math.max(0.1, Number(input.radiusKm) || 5));
  const limit = Math.min(80, Math.max(1, Math.floor(Number(input.limit) || 40)));
  const matches = places
    .filter((place) => !area || String(place.areaSearchText ?? `${place.name} ${place.location} ${place.address ?? ""}`).toLowerCase().includes(area))
    .filter((place) => !categories.size || categories.has(place.subtype))
    .map((place) => ({
      place,
      distanceKm: center && Number.isFinite(place.latitude) && Number.isFinite(place.longitude) ? distanceKm(center, place) : null,
    }))
    .filter(({ distanceKm: distance }) => !center || (distance !== null && distance <= radiusKm))
    .sort((left, right) => center ? left.distanceKm - right.distanceKm : 0)
    .slice(0, limit);
  return { area: area || null, center, radiusKm: center ? radiusKm : null, matches };
}
