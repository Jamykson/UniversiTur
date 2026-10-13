import { stops } from './data.js';
export const PROGRESS_KEY = 'universitour-sequential-v1';
// Only an uninterrupted prefix counts as progress in a sequential trail.
export function normalizeProgress(saved) {
 if (!Array.isArray(saved)) return [];
 const result = [];
 for (const stop of stops) { if (!saved.includes(stop.id)) break; result.push(stop.id); }
 return result;
}
export function nextStop(visited) { return stops[normalizeProgress(visited).length]; }
export function canVisit(stop, visited) { return nextStop(visited)?.id === stop.id; }
