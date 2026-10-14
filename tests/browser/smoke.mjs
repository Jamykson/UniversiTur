import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { setTimeout as wait } from 'node:timers/promises';

// Run against a local Vite server and a local Chrome debugging instance.
const appUrl = process.env.APP_URL || 'http://127.0.0.1:5173/UniversiTur/';
const debugUrl = process.env.BROWSER_DEBUG_URL || 'http://127.0.0.1:9228';
const targets = await (await fetch(`${debugUrl}/json`)).json();
const page = targets.find((target) => target.type === 'page');
assert.ok(page, 'Open a Chrome page with remote debugging enabled');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let sequence = 0;
const pending = new Map();
const runtimeErrors = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const command = pending.get(message.id);
    if (!command) return;
    pending.delete(message.id);
    clearTimeout(command.timeout);
    if (message.error) command.reject(new Error(message.error.message));
    else command.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') {
    runtimeErrors.push(
      message.params.exceptionDetails.exception?.description ||
        message.params.exceptionDetails.text,
    );
  }
});
function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP timeout: ${method}`));
    }, 10000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const response = await call('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.exceptionDetails)
    throw new Error(
      response.exceptionDetails.exception?.description || 'Browser evaluation failed',
    );
  return response.result.value;
}
async function eventually(expression, description, timeout = 7000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await wait(100);
  }
  throw new Error(`Timed out: ${description}`);
}
const progress = () =>
  evaluate("JSON.parse(localStorage.getItem('universitour-sequential-v1') || '[]').length");
const inject = `
localStorage.clear();
window.__gpsWatches = [];
window.__routeCalls = [];
window.__pendingFetch = 0;
window.__routeDelay = 0;
window.__routeFail = false;
window.__reading = (lat, lng, accuracy = 5) => ({ coords: { latitude: lat, longitude: lng, accuracy, heading: null } });
Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
  watchPosition(success, error) {
    const id = window.__gpsWatches.length;
    window.__gpsWatches.push({ success, error, cleared: false });
    success(window.__reading(-5.8415, -35.2003));
    return id;
  },
  clearWatch(id) { if (window.__gpsWatches[id]) window.__gpsWatches[id].cleared = true; }
} });
const originalFetch = window.fetch.bind(window);
window.fetch = async (url, ...args) => {
  if (!String(url).includes('/routed-foot/')) return originalFetch(url, ...args);
  window.__routeCalls.push(String(url));
  window.__pendingFetch++;
  try {
    if (window.__routeDelay) await new Promise(resolve => setTimeout(resolve, window.__routeDelay));
    if (window.__routeFail) throw new Error('Offline');
    const [origin, destination] = String(url).split('/driving/')[1].split('?')[0].split(';').map(point => point.split(',').map(Number));
    return { ok: true, json: async () => ({ code: 'Ok', routes: [{ distance: 350, duration: 240, geometry: { type: 'LineString', coordinates: [origin, [origin[0], destination[1]], destination] } }] }) };
  } finally { window.__pendingFetch--; }
};
`;
try {
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Page.addScriptToEvaluateOnNewDocument', { source: inject });
  await call('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await call('Page.navigate', { url: appUrl });
  await eventually("!!document.querySelector('.destination')", 'React mount');
  await eventually(
    "document.querySelector('.destination p').textContent.includes('min caminhando')",
    'pedestrian route',
  );
  assert.equal(await evaluate('window.__gpsWatches.length'), 1);
  assert.equal(await evaluate("document.querySelectorAll('.discovery-pin.locked').length"), 4);
  assert.equal(await progress(), 0);

  // Delayed callbacks from a cleared GPS watcher must not resume tracking or unlock a stop.
  await evaluate(
    "document.querySelector('.primary').click(); window.__gpsWatches[0].success(window.__reading(-5.8392,-35.2014))",
  );
  await wait(200);
  assert.equal(await progress(), 0);
  assert.ok(
    await evaluate("document.querySelector('.primary').textContent.includes('Retomar GPS')"),
  );

  const fullHeight = await evaluate(
    "document.querySelector('.journey-sheet').getBoundingClientRect().height",
  );
  await evaluate("document.querySelector('.sheet-handle').click()");
  assert.ok(await evaluate("document.querySelector('#sheet-content').hidden"));
  assert.ok(
    (await evaluate("document.querySelector('.journey-sheet').getBoundingClientRect().height")) <
      fullHeight / 2,
  );
  await evaluate("document.querySelector('.sheet-handle').click()");
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [844, 390],
    [1280, 800],
  ]) {
    await call('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 900,
    });
    await wait(100);
    assert.ok(
      await evaluate('document.documentElement.scrollWidth <= innerWidth'),
      `Overflow at ${width}x${height}`,
    );
  }
  await call('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await evaluate("document.querySelector('.simulate-button').click()");
  await eventually(
    "document.querySelector('.simulate-button').textContent.includes('Caminhando')",
    'simulation starts',
  );
  await evaluate(
    "window.__gpsWatches[0].error({code:1}); window.__gpsWatches[0].success(window.__reading(-5.8392,-35.2014)); window.__routeElement=document.querySelector('.leaflet-overlay-pane path')",
  );
  await wait(1200);
  assert.equal(await progress(), 0);
  assert.ok(
    await evaluate("window.__routeElement===document.querySelector('.leaflet-overlay-pane path')"),
    'Route must not be rebuilt every animation frame',
  );
  await eventually("document.querySelector('dialog').open", 'nearby simulated arrival', 16000);
  assert.equal(await progress(), 1);
  await eventually(
    "document.querySelector('.dialog-photo img')?.complete && document.querySelector('.dialog-photo img')?.naturalWidth>0",
    'local photo on GitHub Pages base',
  );
  assert.ok(
    await evaluate(
      "document.querySelector('.dialog-photo img').src.includes('/UniversiTur/images/reitoria.jpg')",
    ),
  );
  await evaluate(
    "document.querySelector('.close-dialog').click(); document.querySelector('.progress-chip').click(); document.querySelector('.sheet-footer button').click()",
  );
  assert.equal(await progress(), 0);

  // A request finishing after pause/reset must not start an obsolete animation.
  await evaluate("window.__routeDelay=1200; document.querySelector('.simulate-button').click()");
  await eventually('window.__pendingFetch > 0', 'pending simulation fetch');
  await evaluate("document.querySelector('.primary').click()");
  await wait(1500);
  assert.equal(await evaluate("!!document.querySelector('.player-marker')"), false);
  assert.equal(await progress(), 0);
  await evaluate("window.__routeDelay=0; document.querySelector('.primary').click()");
  await eventually('window.__gpsWatches.length===2', 'new GPS session');
  await evaluate('window.__gpsWatches[1].success(window.__reading(-5.8392,-35.2014,130))');
  assert.equal(await progress(), 0, 'Inaccurate GPS cannot unlock the current stop');
  await evaluate('window.__gpsWatches[1].success(window.__reading(-5.8407,-35.2011))');
  assert.equal(await progress(), 0, 'Future stops stay locked');
  for (const [index, coordinates] of [
    [-5.8392, -35.2014],
    [-5.8436, -35.1995],
    [-5.8423, -35.2028],
    [-5.8407, -35.2011],
    [-5.8415, -35.2003],
  ].entries()) {
    await evaluate(`window.__gpsWatches[1].success(window.__reading(${coordinates.join(',')}))`);
    await eventually(
      `JSON.parse(localStorage.getItem('universitour-sequential-v1')).length===${index + 1}`,
      'sequential progress',
    );
    await eventually("document.querySelector('dialog').open", 'stop details');
    await evaluate("document.querySelector('.close-dialog').click()");
  }
  await eventually("!!document.querySelector('.completion-screen')", 'completion screen');
  await eventually("document.querySelector('.completion-owl').naturalWidth>0", 'local owl asset');
  assert.equal(await evaluate("document.querySelectorAll('.completion-passport>span').length"), 5);
  const screenshot = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    '/tmp/universitur-refactor-completion.png',
    Buffer.from(screenshot.data, 'base64'),
  );
  await evaluate("document.querySelector('.completion-primary').click()");
  await eventually("!document.querySelector('#trail-list').hidden", 'revisit');
  await evaluate("document.querySelector('.progress-chip').click()");
  await eventually("!!document.querySelector('.completion-secondary')", 'reopen completion');
  await evaluate("document.querySelector('.completion-secondary').click()");
  assert.equal(await progress(), 0);
  assert.equal(runtimeErrors.length, 0, runtimeErrors.join('\n'));
  console.log(
    'PASS: automatic GPS, stale callbacks, walking route, simulation curves and arrival, cancellation, sequential unlocking, local images under base path, mobile layouts, completion, revisit and reset.',
  );
} finally {
  socket.close();
  for (const command of pending.values()) clearTimeout(command.timeout);
}
