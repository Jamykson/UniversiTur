import test from 'node:test';
import assert from 'node:assert/strict';
import { distance, bearing, isCoordinate, formatDistance } from '../src/geography.js';
import { publicAsset } from '../src/assets.js';

test('validates geographic coordinates and computes stable distances', () => {
  for (const value of [null, [], [NaN, 0], [Infinity, 0], [91, 0], [0, 181], ['0', 0]]) {
    assert.equal(isCoordinate(value), false);
  }
  assert.equal(isCoordinate([-5.84, -35.2]), true);
  assert.equal(distance([0, 0], [0, 0]), 0);
  assert.ok(Number.isFinite(distance([45, 120], [-45, -60])));
  assert.ok(Math.abs(distance([0, 0], [0, 0.001]) - 111.195) < 0.01);
  assert.equal(bearing([0, 0], [0, 1]), 90);
  assert.equal(formatDistance(1234), '1,2 km');
});

test('local image paths respect both root and GitHub Pages base paths', () => {
  assert.equal(publicAsset('images/reitoria.jpg', '/'), '/images/reitoria.jpg');
  assert.equal(
    publicAsset('/images/reitoria.jpg', '/UniversiTur/'),
    '/UniversiTur/images/reitoria.jpg',
  );
  assert.equal(
    publicAsset('images/coruja-conquista.png', '/UniversiTur/'),
    '/UniversiTur/images/coruja-conquista.png',
  );
});
