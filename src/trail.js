import { stops } from './data.js';
export const PROGRESS_KEY = 'universitour-sequential-v1';
// Keep valid recorded visits when the itinerary is reordered; only the first
// unvisited stop can be unlocked. The original Reitoria start is still required.
export function normalizeProgress(saved) {
  if (!Array.isArray(saved) || !saved.includes(stops[0].id)) return [];
  return stops.filter((stop) => saved.includes(stop.id)).map((stop) => stop.id);
}
export function nextStop(visited) {
  const completed = normalizeProgress(visited);
  return stops.find((stop) => !completed.includes(stop.id));
}

export function canVisit(stop, visited) {
  return nextStop(visited)?.id === stop.id;
}

export function readProgress() {
  try {
    return normalizeProgress(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]'));
  } catch {
    return [];
  }
}

export function saveProgress(visited) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(normalizeProgress(visited)));
  } catch {
    /* Browsers may deny storage; the in-memory trail still works. */
  }
}
