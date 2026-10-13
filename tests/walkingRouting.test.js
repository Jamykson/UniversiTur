import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWalkingRoute } from '../src/walkingRouting.js';

test('map and simulation router uses the pedestrian graph and keeps walking duration', async () => {
 const original = globalThis.fetch;
 let requested;
 globalThis.fetch = async url => {
  requested = new URL(url);
  return { ok: true, json: async () => ({ code: 'Ok', routes: [{ geometry: { coordinates: [[-35.20, -5.84], [-35.21, -5.85]] }, distance: 150, duration: 120 }] }) };
 };
 try {
  const route = await fetchWalkingRoute([-5.84, -35.20], { id: 'reitoria', coords: [-5.85, -35.21] });
  assert.ok(requested.pathname.startsWith('/routed-foot/'));
  assert.ok(!requested.pathname.includes('/routed-car/'));
  assert.equal(route.travelMode, 'walking');
  assert.equal(route.duration, 120);
  assert.deepEqual(route.points, [[-5.84, -35.20], [-5.85, -35.21]]);
 } finally { globalThis.fetch = original; }
});
