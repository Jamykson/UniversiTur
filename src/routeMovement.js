import { distance, isCoordinate } from './geography.js';

export function prepareRoute(points) {
  if (!Array.isArray(points) || points.length < 2 || points.some((p) => !isCoordinate(p)))
    throw new Error('Invalid route');
  const cumulative = [0];
  for (let i = 1; i < points.length; i++)
    cumulative.push(cumulative[i - 1] + distance(points[i - 1], points[i]));
  return { points, cumulative, length: cumulative.at(-1) };
}
// Advance by distance along the polyline, rather than by vertex count or a direct line.
export function routePosition(route, progress) {
  const { points, cumulative, length } = route;
  const travelled = Math.max(0, Math.min(1, progress)) * length;
  if (travelled >= length) return points.at(-1);
  let low = 1,
    high = cumulative.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (cumulative[mid] < travelled) low = mid + 1;
    else high = mid;
  }
  const i = low,
    segment = cumulative[i] - cumulative[i - 1];
  const t = segment ? (travelled - cumulative[i - 1]) / segment : 0;
  return points[i - 1].map((value, axis) => value + (points[i][axis] - value) * t);
}

export const GPS_ARRIVAL_RADIUS = 45;
export const SIMULATION_ARRIVAL_RADIUS = 30;
export function reachedRouteDestination(route, progress, destination) {
  const proximity = distance(routePosition(route, progress), destination);
  const remaining = route.length * (1 - Math.max(0, Math.min(1, progress)));
  // Allow a snapped route endpoint, but never unlock a distant destination.
  return (
    proximity <= SIMULATION_ARRIVAL_RADIUS ||
    (remaining <= SIMULATION_ARRIVAL_RADIUS && proximity <= GPS_ARRIVAL_RADIUS)
  );
}
