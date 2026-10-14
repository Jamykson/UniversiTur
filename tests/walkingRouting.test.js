import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWalkingRoute, parseWalkingRoute } from '../src/walkingRouting.js';

test('map and simulation router uses the pedestrian graph and keeps walking duration', async () => {
  const original = globalThis.fetch;
  let requested;
  globalThis.fetch = async (url) => {
    requested = new URL(url);
    return {
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [
          {
            geometry: {
              coordinates: [
                [-35.2, -5.84],
                [-35.21, -5.85],
              ],
            },
            distance: 150,
            duration: 120,
          },
        ],
      }),
    };
  };
  try {
    const route = await fetchWalkingRoute([-5.84, -35.2], {
      id: 'reitoria',
      coords: [-5.85, -35.21],
    });
    assert.ok(requested.pathname.startsWith('/routed-foot/'));
    assert.ok(!requested.pathname.includes('/routed-car/'));
    assert.equal(route.travelMode, 'walking');
    assert.equal(route.duration, 120);
    assert.deepEqual(route.points, [
      [-5.84, -35.2],
      [-5.85, -35.21],
    ]);
  } finally {
    globalThis.fetch = original;
  }
});

test('rejects invalid routing coordinates before sending a request', async () => {
  await assert.rejects(fetchWalkingRoute([NaN, 0], { id: 'test', coords: [0, 0] }), TypeError);
  await assert.rejects(fetchWalkingRoute([0, 0], { id: 'test', coords: [91, 0] }), TypeError);
});

test('validates geometry, distance and walking duration from external responses', () => {
  const valid = {
    code: 'Ok',
    routes: [
      {
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
        distance: 120,
        duration: 100,
      },
    ],
  };
  assert.equal(parseWalkingRoute(valid, 'stop').travelMode, 'walking');
  for (const change of [
    (data) => {
      data.code = 'NoRoute';
    },
    (data) => {
      data.routes = [];
    },
    (data) => {
      data.routes[0].geometry = null;
    },
    (data) => {
      data.routes[0].geometry.type = 'Polygon';
    },
    (data) => {
      data.routes[0].geometry.coordinates = [[0, 0]];
    },
    (data) => {
      data.routes[0].geometry.coordinates[1] = [181, 0];
    },
    (data) => {
      data.routes[0].geometry.coordinates[1] = [0, NaN];
    },
    (data) => {
      data.routes[0].duration = -1;
    },
    (data) => {
      data.routes[0].distance = '120';
    },
  ]) {
    const data = structuredClone(valid);
    change(data);
    assert.throws(() => parseWalkingRoute(data, 'stop'));
  }
});

test('cancelled requests cannot return a route or start a fetch', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error('Should not run');
  };
  try {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
      fetchWalkingRoute([0, 0], { id: 'stop', coords: [0, 1] }, controller.signal),
    );
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = original;
  }
});

test('HTTP failures are reported instead of becoming a usable route', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  try {
    await assert.rejects(
      fetchWalkingRoute([0, 0], { id: 'stop', coords: [0, 1] }),
      /Routing unavailable/,
    );
  } finally {
    globalThis.fetch = original;
  }
});

test('late transport responses cannot resurrect a cancelled request', async () => {
  const original = globalThis.fetch;
  const controller = new AbortController();
  globalThis.fetch = async () => {
    controller.abort();
    return {
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [
          {
            geometry: {
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
            distance: 120,
            duration: 60,
          },
        ],
      }),
    };
  };
  try {
    await assert.rejects(
      fetchWalkingRoute([0, 0], { id: 'stop', coords: [0, 1] }, controller.signal),
    );
  } finally {
    globalThis.fetch = original;
  }
});
