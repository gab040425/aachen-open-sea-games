import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'vite';

// --mock checks the actual opt-in source. Normal checks keep their isolated fixture
// injection and force the flag off, regardless of a developer's local env setting.
const useMockMode = process.argv.includes('--mock');
const server = await createServer({
  server: { host: '127.0.0.1', port: 0 },
  define: { 'import.meta.env.VITE_USE_MOCK_MATCHES': JSON.stringify(useMockMode ? 'true' : 'false') },
  plugins: useMockMode ? [] : [{
  name: 'isolated-match-fixtures', enforce: 'pre',
  transform(code, id) { if (id.replaceAll('\\', '/').endsWith('/src/data/matches.js')) return code.replace('return [];', 'if (globalThis.__ACOP_TEST_ERROR__) throw new Error("Test failure"); return globalThis.__ACOP_TEST_MATCHES__ || [];'); },
}] });
await server.listen();
const origin = server.resolvedUrls.local[0];
// Isolate storage and browser state from the user's normal Chrome profile.
const profile = await mkdtemp(path.join(tmpdir(), 'acop-browser-'));
const browser = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
let checks = 0;
try {
  const debugUrl = await new Promise((resolve, reject) => {
    let output = '';
    browser.stderr.on('data', (data) => { output += data.toString(); const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) resolve(match[1]); });
    browser.once('error', reject);
    browser.once('exit', (code) => reject(new Error(`Chrome exited ${code}`)));
  });
  const port = new URL(debugUrl).port;
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find(({ type }) => type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
  let id = 0;
  // Match asynchronous CDP replies to their requests using protocol message IDs.
  const pending = new Map();
  socket.addEventListener('message', ({ data }) => { const value = JSON.parse(data); if (pending.has(value.id)) { const { resolve, reject } = pending.get(value.id); pending.delete(value.id); if (value.error) reject(new Error(JSON.stringify(value.error))); else resolve(value.result); } });
  const command = (method, params = {}) => new Promise((resolve, reject) => { const seq = ++id; pending.set(seq, { resolve, reject }); socket.send(JSON.stringify({ id: seq, method, params })); });
  const evaluate = async (expression) => { const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
  // Return primitives across CDP; serializing DOM nodes can fail on deep references.
  const waitFor = async (expression) => { for (let i = 0; i < 100; i++) { if (await evaluate(`Boolean(${expression})`)) return; await delay(50); } throw new Error(`Timed out: ${expression}`); };
  const check = async (name, fn) => { await fn(); checks++; console.log(`PASS ${name}`); };
  await command('Page.enable');
  // Headless tabs need an active document to dispatch native focusin events.
  await command('Emulation.setFocusEmulationEnabled', { enabled: true });
  await command('Page.addScriptToEvaluateOnNewDocument', { source: `window.__scrolls=[];const nativeScroll=window.scrollTo;window.scrollTo=function(...args){if(typeof args[0] === "object") window.__scrolls.push({options:args[0]});return nativeScroll.apply(this,args)};` });
  const navigate = async (route = '/matches') => { await command('Page.navigate', { url: `${origin.replace(/\/$/, '')}${route}` }); await waitFor('document.querySelector(".matches-state") && !document.querySelector(".matches-state").textContent.includes("Loading")'); };
  if (useMockMode) {
    await command('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await check('Actual development flag loads mock fixtures for every sport and both days', async () => {
      await command('Page.navigate', { url: `${origin}matches` });
      await waitFor('document.querySelector(".matches-controls")');
      await evaluate('document.querySelectorAll(".matches-day-selector button")[0].click()');
      await waitFor('document.querySelectorAll(".matches-match-card").length === 10');
      for (let sport = 0; sport < 5; sport++) {
        await evaluate(`document.querySelectorAll('.matches-sport-selector button')[${sport}].click()`);
        await waitFor('document.querySelectorAll(".matches-match-card").length === 10');
        assert.equal(await evaluate('document.querySelectorAll(".matches-status--live").length'), 2);
        assert.match(await evaluate('document.querySelector(".matches-list").textContent'), /Demo Harbor Comets/);
        await evaluate('document.querySelectorAll(".matches-day-selector button")[1].click()');
        await waitFor('document.querySelectorAll(".matches-match-card").length === 2');
        await evaluate('document.querySelectorAll(".matches-day-selector button")[0].click()');
        await waitFor('document.querySelectorAll(".matches-match-card").length === 10');
      }
    });
    await check('Actual mock LIVE target centers after smooth scrolling without a tournament-date dependency', async () => {
      await command('Page.navigate', { url: `${origin}matches` });
      await waitFor('document.querySelector(".matches-controls")');
      await evaluate('document.querySelectorAll(".matches-sport-selector button")[0].click(); document.querySelectorAll(".matches-day-selector button")[0].click()');
      await waitFor('document.querySelectorAll(".matches-match-card").length === 10');
      await waitFor('(() => {const card=document.querySelector("[data-match-id=VB02]");if(!card)return false;const r=card.getBoundingClientRect();return Math.abs((r.top+r.bottom)/2-(innerHeight+document.querySelector(".nav").getBoundingClientRect().bottom)/2)<3})()');
      assert.equal(await evaluate('document.querySelector(".matches-controls").dataset.hidden'), 'true');
      const count = await evaluate('window.__scrolls.length');
      await evaluate('document.querySelector("#matches-tab-bracket").click()');
      await waitFor('document.querySelector(".matches-state")');
      await evaluate('document.querySelector("#matches-tab-list").click()');
      await waitFor('document.querySelectorAll(".matches-match-card").length === 10');
      await delay(100);
      assert.equal(await evaluate('window.__scrolls.length'), count, 'Tab rerender must not restart automatic scrolling');
    });
    await check('Mock score boxes fit single/double/triple digits on cards and Battle Pages', async () => {
      for (const width of [1280, 768, 390, 320]) {
        await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
        for (const sport of [0, 1]) {
          await evaluate(`document.querySelectorAll('.matches-sport-selector button')[${sport}].click()`);
          await waitFor('document.querySelectorAll(".matches-match-card").length === 10');
          assert.equal(await evaluate('[...document.querySelectorAll(".matches-score")].every(el => el.scrollWidth <= el.clientWidth+1)'), true, `Card score overflow at ${width}`);
          assert.equal(await evaluate('[...document.querySelectorAll(".matches-match-card")].every(el => el.scrollWidth <= el.clientWidth+1)'), true, `Card overflow at ${width}`);
        }
      }
      for (const id of ['VB07', 'VB08', 'VB09', 'VB10', 'BB01']) {
        await command('Page.navigate', { url: `${origin}matches/${id}` });
        await waitFor('document.querySelector(".battle-page__scoreboard")');
        for (const width of [1280, 768, 390, 320]) {
          await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
          assert.equal(await evaluate('document.querySelector(".matches-score").scrollWidth <= document.querySelector(".matches-score").clientWidth+1'), true, `Battle score overflow ${id} at ${width}`);
          assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Battle overflow ${id} at ${width}`);
        }
      }
    });
    await check('Direct mock VB02 Battle Page has complete scoreboard/lineups; VB01 has fallbacks', async () => {
      await command('Page.navigate', { url: `${origin}matches/VB02` });
      await waitFor('document.querySelector(".battle-page__scoreboard")');
      assert.match(await evaluate('document.querySelector(".battle-page__header").textContent'), /Demo Harbor Comets vs Demo Forest Owls/);
      assert.match(await evaluate('document.querySelector(".battle-page__metadata").textContent'), /Demo Court A/);
      assert.equal(await evaluate('document.querySelectorAll(".battle-page__lineup li").length'), 16);
      assert.equal(await evaluate('document.querySelectorAll(".battle-page__captain").length'), 2);
      assert.equal(await evaluate('document.querySelector(".matches-status").textContent.includes("LIVE")'), true);
      assert.equal(await evaluate('Array.from(document.querySelectorAll(".matches-team-logo")).filter(logo => logo.tagName === "IMG" && logo.src.startsWith("data:image/svg+xml")).length'), 4);
      await command('Page.navigate', { url: `${origin}matches/VB01` });
      await waitFor('document.querySelector(".battle-page__scoreboard")');
      assert.match(await evaluate('document.querySelector(".battle-page__unavailable").textContent'), /Lineup not available yet/);
      assert.equal(await evaluate('document.querySelectorAll(".matches-team-logo--fallback").length'), 2);
    });
  } else {
  await navigate();
  await check('Empty schedule, tabs, day controls, and selected sport persistence', async () => {
    assert.match(await evaluate('document.querySelector(".matches-state").textContent'), /Match schedule coming soon/);
    await evaluate('document.querySelectorAll(".matches-sport-selector button")[4].click()');
    assert.equal(await evaluate('localStorage.getItem("acop.matches.sport")'), 'chess');
    await navigate();
    assert.equal(await evaluate('document.querySelector(".matches-sport-selector button[aria-pressed=true]").textContent'), 'Chess');
    await evaluate('document.querySelector("#matches-tab-bracket").click()');
    assert.match(await evaluate('document.querySelector(".matches-state").textContent'), /Tournament bracket coming soon/);
    // Exercise actual native key events after extracting the named tab handler.
    await evaluate('document.querySelector("#matches-tab-bracket").focus()');
    for (const [key, selected] of [['ArrowLeft', 'list'], ['ArrowRight', 'bracket'], ['Home', 'list'], ['End', 'bracket']]) {
      await command('Input.dispatchKeyEvent', { type: 'keyDown', key });
      await waitFor(`document.querySelector('#matches-tab-${selected}').getAttribute('aria-selected') === 'true'`);
      assert.equal(await evaluate('document.activeElement.id'), `matches-tab-${selected}`);
    }
    await evaluate('document.querySelectorAll(".matches-day-selector button")[1].click()');
    assert.match(await evaluate('document.querySelector(".matches-day-selector button[aria-pressed=true]").textContent'), /Day 2/);
    await evaluate('localStorage.setItem("acop.matches.sport", "invalid")');
    await navigate();
    assert.equal(await evaluate('document.querySelector(".matches-sport-selector button[aria-pressed=true]").textContent'), 'Volleyball');
  });
  await check('Navbar and page fit desktop, tablet, and mobile widths', async () => {
    for (const width of [1600, 1481, 1280, 1181, 1180, 860, 768, 390, 320]) {
      await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Page overflow at ${width}`);
      if (width > 1180) assert.equal(await evaluate('document.querySelector(".nav-brand").getBoundingClientRect().right <= document.querySelector(".nav-links").getBoundingClientRect().left'), true, `Navbar overlap at ${width}`);
    }
    await evaluate('document.querySelector(".nav-toggle").click()');
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".nav-links")).display'), 'flex');
    assert.equal(await evaluate('document.querySelector(".nav-links a.active").textContent'), 'Schedule');
    await evaluate('document.querySelector(".nav-toggle").click()');
  });
  await check('Direct missing-match route and reload', async () => { await navigate('/matches/unknown'); assert.match(await evaluate('document.querySelector(".matches-state").textContent'), /Match not found/); await navigate('/matches/unknown'); assert.equal(await evaluate('document.querySelector(".nav-links a.active").textContent'), 'Schedule'); });
  const fixture = Array.from({ length: 10 }, (_, index) => ({ matchId: `TEST${String(index).padStart(2, '0')}`, sport: 'volleyball', day: 1, scheduledAt: `2026-12-05T${String(8 + index).padStart(2, '0')}:00:00+01:00`, stage: 'Test stage', court: 'Test court', status: index === 5 || index === 6 ? 'LIVE' : index < 5 ? 'FINISHED' : 'UPCOMING', teamA: { id: 'a', name: 'Very long test team name that should wrap safely', logo: '/missing-test-logo.png', players: [{ id: 'p1', name: 'First' }, { id: 'p2', name: 'Captain', isCaptain: true }] }, teamB: { id: 'b', name: 'Another long test team name' }, scoreA: index < 7 ? 0 : null, scoreB: index < 7 ? 1 : null }));
  await command('Page.addScriptToEvaluateOnNewDocument', { source: `window.__ACOP_TEST_MATCHES__=${JSON.stringify(fixture)};localStorage.setItem('acop.matches.sport','volleyball');` });
  await command('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await command('Page.navigate', { url: `${origin}matches` });
  await waitFor('document.querySelectorAll(".matches-day-selector button").length === 2');
  await evaluate('document.querySelectorAll(".matches-day-selector button")[0].click()');
  await waitFor('document.querySelectorAll(".matches-match-card").length === 10');
  await check('Automatic scroll centers earliest simultaneous LIVE match and respects reduced motion', async () => {
    await waitFor('window.__scrolls.length > 0');

    assert.equal(await evaluate('window.__scrolls[0].options.behavior'), 'instant');
    assert.equal(await evaluate('document.querySelectorAll(".matches-match-card--live").length'), 2);
    const center = await evaluate('(() => {const r=document.querySelectorAll(".matches-list__item")[5].getBoundingClientRect();return (r.top+r.bottom)/2})()');
    const visibleCenter = await evaluate('(innerHeight + document.querySelector(".nav").getBoundingClientRect().bottom) / 2');
    assert.ok(Math.abs(center - visibleCenter) < 10, `Target center ${center}; visible center ${visibleCenter}`);
    await evaluate('document.querySelectorAll(".matches-sport-selector button")[0].click()');
    await delay(100);
    assert.equal(await evaluate('window.__scrolls.length'), 1);
    await evaluate('document.querySelectorAll(".matches-day-selector button")[1].click()');
    await waitFor('document.querySelectorAll(".matches-match-card").length === 0');
    await evaluate('document.querySelectorAll(".matches-day-selector button")[0].click()');
    await waitFor('window.__scrolls.length === 2');
  });
  await check('Controls hide down, reveal up below nav, and remain compact on mobile', async () => {
    for (const [width, height] of [[1280, 900], [768, 900], [390, 740], [320, 700]]) {
      await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      await delay(100);
      await evaluate('document.querySelectorAll(".matches-list__item")[5].scrollIntoView({block:"center",behavior:"instant"})');
      await delay(100);
      await evaluate('window.scrollBy({top:120,behavior:"instant"})');
      await waitFor('document.querySelector(".matches-controls").dataset.hidden === "true"');
      await delay(100);
      await evaluate('window.scrollBy({top:-80,behavior:"instant"})');
      await waitFor('document.querySelector(".matches-controls").dataset.hidden === "false"');
      await delay(200);
      assert.equal(await evaluate('Math.abs(document.querySelector(".matches-controls").getBoundingClientRect().top-document.querySelector(".nav").getBoundingClientRect().bottom)<2'), true);
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
      assert.equal(await evaluate('document.querySelector(".matches-controls").offsetHeight < innerHeight*.4'), true);
      await evaluate('window.scrollBy({top:-2,behavior:"instant"})');
      await delay(50);
      assert.equal(await evaluate('document.querySelector(".matches-controls").dataset.hidden'), 'false');
      const covered = await evaluate('(() => {const panel=document.querySelector(".matches-controls").getBoundingClientRect();const card=[...document.querySelectorAll(".matches-match-card")].find(el=>{const r=el.getBoundingClientRect();return r.top < panel.bottom && r.bottom > panel.top});if(!card)return false;card.focus({preventScroll:true});return true})()');
      if (covered) {
        await waitFor('document.querySelector(".matches-controls").dataset.hidden === "true"');
      }
      await evaluate('document.activeElement.blur(); window.scrollTo({top:0,behavior:"instant"})');
      await waitFor('document.querySelector(".matches-controls").dataset.hidden === "false"');
      await evaluate('document.querySelectorAll(".matches-list__item")[5].scrollIntoView({block:"center",behavior:"instant"})');
      await delay(100);
    }
  });
  await check('Fixture cards and Battle Page fit responsive widths; captain, logo fallback, and return selection work', async () => {
    for (const width of [1280, 768, 390, 320]) {
      await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      assert.equal(await evaluate('[...document.querySelectorAll(".matches-match-card")].every(el => el.scrollWidth <= el.clientWidth)'), true, `Card overflow at ${width}`);
    }
    await evaluate('document.querySelectorAll(".matches-match-card")[5].click()');
    await waitFor('document.querySelector(".battle-page__scoreboard")');
    assert.equal(await evaluate('document.querySelector(".matches-controls") === null'), true, 'Sticky controls must unmount with the overview');
    assert.equal(await evaluate('document.querySelector(".battle-page__captain").previousElementSibling.textContent'), 'Captain');
    await waitFor('document.querySelectorAll(".matches-team-logo--fallback").length === 4');
    for (const width of [1280, 768, 390, 320]) {
      await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Battle Page overflow at ${width}`);
    }
    await evaluate('document.querySelector(".battle-page__back").click()');
    await waitFor('document.querySelectorAll(".matches-match-card").length === 10');
    assert.match(await evaluate('document.querySelector(".matches-day-selector button[aria-pressed=true]").textContent'), /Day 1/);
  });
  await check('Provider failure presents a retry that recovers', async () => {
    await command('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__ACOP_TEST_ERROR__ = true;' });
    await navigate();
    assert.match(await evaluate('document.querySelector(".matches-state").textContent'), /Unable to load the schedule/);
    await evaluate('window.__ACOP_TEST_ERROR__ = false; document.querySelector(".matches-retry").click()');
    await waitFor('document.querySelectorAll(".matches-day-selector button").length === 2');
    await evaluate('document.querySelectorAll(".matches-day-selector button")[0].click()');
    await waitFor('document.querySelectorAll(".matches-match-card").length === 10');
  });
  }
  console.log(`${checks} ${useMockMode ? 'mock-mode ' : ''}browser checks passed.`);
} finally {
  // Tear down only resources created by this run, including its temporary profile.
  socket?.close();
  browser.kill();
  await server.close();
  await delay(500);
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
