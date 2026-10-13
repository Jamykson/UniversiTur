import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareRoute, routePosition, reachedRouteDestination } from '../src/routeMovement.js';

test('movement reaches each corner instead of cutting diagonally across the route', () => {
 const points = [[-5.84, -35.20], [-5.84, -35.199], [-5.842, -35.199], [-5.842, -35.198]];
 const route = prepareRoute(points);
 for (let i = 0; i < points.length; i++) {
  const actual = routePosition(route, route.cumulative[i] / route.length);
  actual.forEach((coordinate, axis) => assert.ok(Math.abs(coordinate - points[i][axis]) < 1e-10));
 }
 for (let i = 1; i < points.length; i++) {
  const halfway = (route.cumulative[i - 1] + route.cumulative[i]) / (2 * route.length);
  const actual = routePosition(route, halfway);
  actual.forEach((coordinate, axis) => assert.ok(Math.abs(coordinate - (points[i - 1][axis] + points[i][axis]) / 2) < 1e-10));
 }
});

test('progress follows segment distances, including uneven segments', () => {
 const route = prepareRoute([[0, 0], [0, .001], [0, .004]]);
 assert.ok(Math.abs(routePosition(route, .5)[1] - .002) < 1e-10);
});

test('handles endpoints, duplicate vertices and invalid geometry', () => {
 const route = prepareRoute([[0, 0], [0, 0], [0, .001]]);
 assert.deepEqual(routePosition(route, -1), [0, 0]);
 assert.deepEqual(routePosition(route, 2), [0, .001]);
 assert.deepEqual(routePosition(prepareRoute([[0, 0], [0, 0]]), .5), [0, 0]);
 assert.throws(() => prepareRoute([]));
 assert.throws(() => prepareRoute([[0, 0], [NaN, 1]]));
});


test('arrival opens the stop before reaching the exact endpoint', () => {
 const points = [[0, 0], [0, .001], [.001, .001]];
 const route = prepareRoute(points), destination = points.at(-1);
 const nearEnd = 1 - 25 / route.length;
 assert.equal(reachedRouteDestination(route, nearEnd, destination), true);
 assert.notDeepEqual(routePosition(route, nearEnd), destination);
 assert.equal(reachedRouteDestination(route, 1 - 60 / route.length, destination), false);
});

test('short routes arrive immediately and distant snapped endpoints stay locked', () => {
 const route = prepareRoute([[0, 0], [0, .0001]]);
 assert.equal(reachedRouteDestination(route, 0, [0, .0001]), true);
 assert.equal(reachedRouteDestination(route, 1, [0, .002]), false);
 // An accessible endpoint 35m from the stop remains a valid nearby arrival.
 assert.equal(reachedRouteDestination(route, 1, [0, .000415]), true);
});
