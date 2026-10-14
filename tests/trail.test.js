import test from 'node:test';
import assert from 'node:assert/strict';
import { stops } from '../src/data.js';
import {
  PROGRESS_KEY,
  normalizeProgress,
  nextStop,
  canVisit,
  readProgress,
  saveProgress,
} from '../src/trail.js';

test('only a contiguous prefix unlocks the next stop', () => {
  assert.deepEqual(normalizeProgress(null), []);
  assert.deepEqual(normalizeProgress({ length: 5 }), []);
  assert.deepEqual(normalizeProgress(['ect', 'cb']), []);
  assert.deepEqual(normalizeProgress(['reitoria', 'cb', 'reitoria', 'unknown']), ['reitoria']);
  for (let index = 0; index < stops.length; index++) {
    const visited = stops.slice(0, index).map((stop) => stop.id);
    assert.equal(nextStop(visited), stops[index]);
    for (const stop of stops) assert.equal(canVisit(stop, visited), stop === stops[index]);
  }
  assert.equal(nextStop(stops.map((stop) => stop.id)), undefined);
});

test('keeps the existing storage key and tolerates corrupt or denied storage', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let saved = 'not JSON';
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem(key) {
        assert.equal(key, PROGRESS_KEY);
        return saved;
      },
      setItem(key, value) {
        assert.equal(key, 'universitour-sequential-v1');
        saved = value;
      },
    },
  });
  try {
    assert.deepEqual(readProgress(), []);
    saveProgress(['reitoria', 'ect', 'unknown']);
    assert.deepEqual(readProgress(), ['reitoria', 'ect']);
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('Denied');
      },
    });
    assert.deepEqual(readProgress(), []);
    assert.doesNotThrow(() => saveProgress(['reitoria']));
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});
