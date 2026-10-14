import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { stops } from '../src/data.js';

const measured = JSON.parse(readFileSync(new URL('../docs/route-distances.json', import.meta.url)));
function permutations(values) {
  if (!values.length) return [[]];
  return values.flatMap((value, index) =>
    permutations(values.filter((_, i) => i !== index)).map((rest) => [value, ...rest]),
  );
}
function cost(ids) {
  return ids
    .slice(1)
    .reduce(
      (sum, id, index) =>
        sum + measured.distancesMeters[measured.ids.indexOf(ids[index])][measured.ids.indexOf(id)],
      0,
    );
}

test('itinerary is the shortest open walking route from Reitoria in the measured matrix', () => {
  const ids = stops.map((stop) => stop.id);
  assert.equal(ids[0], 'reitoria');
  assert.equal(new Set(ids).size, 5);
  assert.deepEqual(ids, measured.optimizedOrder);
  for (const stop of stops)
    assert.deepEqual(stop.coords, measured.coordinates[measured.ids.indexOf(stop.id)]);
  const alternatives = permutations(ids.slice(1)).map((rest) => cost(['reitoria', ...rest]));
  assert.equal(alternatives.length, 24);
  assert.equal(cost(ids), Math.min(...alternatives));
  assert.ok(cost(ids) < measured.previousDistanceMeters);
});

test('favicon is explicitly declared using the deployment base', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /rel="icon"[^>]*href="%BASE_URL%favicon\.svg"/);
  assert.ok(existsSync(new URL('../public/favicon.svg', import.meta.url)));
});
