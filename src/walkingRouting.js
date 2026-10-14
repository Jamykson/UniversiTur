import { isCoordinate } from './geography.js';

// The pedestrian graph is selected by /routed-foot/. "driving" is the
// OSRM protocol token retained by this server, not a choice of car transport.
export const WALKING_ROUTER = 'https://routing.openstreetmap.de/routed-foot';
const REQUEST_TIMEOUT_MS = 12000;
let nextRequestAt = 0;

async function waitForSlot(signal) {
  if (signal.aborted) throw signal.reason;
  while (Date.now() < nextRequestAt) {
    const delay = nextRequestAt - Date.now();
    await new Promise((resolve, reject) => {
      const finish = () => {
        signal.removeEventListener('abort', abort);
        resolve();
      };
      const timer = setTimeout(finish, delay);
      const abort = () => {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        reject(signal.reason);
      };
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
    });
  }
  if (signal.aborted) throw signal.reason;
  // Reserve a slot only when a request starts, so cancellation cannot build a queue.
  nextRequestAt = Date.now() + 1000;
}

export function parseWalkingRoute(data, id) {
  const route = data?.routes?.[0];
  const coordinates = route?.geometry?.coordinates;
  if (
    data?.code !== 'Ok' ||
    (route?.geometry?.type && route.geometry.type !== 'LineString') ||
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    !coordinates.every(
      (point) => Array.isArray(point) && point.length === 2 && isCoordinate([point[1], point[0]]),
    ) ||
    !Number.isFinite(route.distance) ||
    route.distance < 0 ||
    !Number.isFinite(route.duration) ||
    route.duration < 0
  ) {
    throw new Error('Invalid walking route response');
  }
  return {
    id,
    status: 'ready',
    travelMode: 'walking',
    points: coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    distance: route.distance,
    duration: route.duration,
  };
}

export async function fetchWalkingRoute(position, next, signal) {
  if (!isCoordinate(position) || !isCoordinate(next?.coords))
    throw new TypeError('Invalid route coordinates');
  const controller = new AbortController();
  const abort = () => controller.abort(signal.reason);
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  const timeout = setTimeout(
    () => controller.abort(new Error('Walking route timed out')),
    REQUEST_TIMEOUT_MS,
  );
  try {
    await waitForSlot(controller.signal);
    const coordinates = `${position[1]},${position[0]};${next.coords[1]},${next.coords[0]}`;
    const response = await fetch(
      `${WALKING_ROUTER}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`,
      { signal: controller.signal },
    );
    if (!response.ok) throw new Error('Routing unavailable');
    const data = await response.json();
    if (controller.signal.aborted) throw controller.signal.reason;
    return parseWalkingRoute(data, next.id);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
