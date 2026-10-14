export const CAMPUS = [-5.8415, -35.2011];
const RADIANS = Math.PI / 180;
const EARTH_RADIUS_METERS = 6371000;

export function isCoordinate(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(Number.isFinite) &&
    Math.abs(value[0]) <= 90 &&
    Math.abs(value[1]) <= 180
  );
}

export function distance(origin, destination) {
  const latitudeDelta = (destination[0] - origin[0]) * RADIANS;
  const longitudeDelta = (destination[1] - origin[1]) * RADIANS;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(origin[0] * RADIANS) *
      Math.cos(destination[0] * RADIANS) *
      Math.sin(longitudeDelta / 2) ** 2;
  const clamped = Math.max(0, Math.min(1, haversine));
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped));
}

export function bearing(origin, destination) {
  const latitude1 = origin[0] * RADIANS;
  const latitude2 = destination[0] * RADIANS;
  const longitudeDelta = (destination[1] - origin[1]) * RADIANS;
  return (
    (Math.atan2(
      Math.sin(longitudeDelta) * Math.cos(latitude2),
      Math.cos(latitude1) * Math.sin(latitude2) -
        Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta),
    ) /
      RADIANS +
      360) %
    360
  );
}

export const formatDistance = (meters) =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(meters)} m`;
