import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { defaultMatchDay, filterMatches, findMatch, getMatches, scrollTarget, sortMatches, validSport } from '../src/data/matches.js';
import mockMatches from '../src/data/matches.mock.js';
import sports from '../src/data/sports.js';
import merch from '../src/data/merch.js';

let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log(`PASS ${name}`); };
// Keep illustrative records in tests only; overrides exercise individual edge cases.
const fixture = (matchId, status, hour, extra = {}) => ({ matchId, sport: 'volleyball', day: 1, scheduledAt: `2026-12-05T${hour}:00:00+01:00`, status, stage: 'Test stage', court: 'Test court', teamA: { id: 'a', name: 'Test Team A', players: [{ id: 'p1', name: 'First Player' }, { id: 'p2', name: 'Captain Player', isCaptain: true }] }, teamB: { id: 'b', name: 'Test Team B' }, ...extra });
const matches = [fixture('T04', 'UPCOMING', '13'), fixture('T03', 'LIVE', '11'), fixture('T01', 'FINISHED', '10'), fixture('T02', 'LIVE', '11')];
check('Berlin date boundary and later dates', () => {
  assert.equal(defaultMatchDay(new Date('2026-12-05T22:59:59Z')), 1);
  assert.equal(defaultMatchDay(new Date('2026-12-05T23:00:00Z')), 2);
  assert.equal(defaultMatchDay(new Date('2027-01-01T00:00:00Z')), 2);
});
check('Stored sport validation', () => { assert.equal(validSport('chess'), 'chess'); assert.equal(validSport('invalid'), 'volleyball'); assert.equal(validSport(null), 'volleyball'); });
check('Chronological ordering and deterministic ties without mutation', () => { assert.deepEqual(sortMatches(matches).map(({ matchId }) => matchId), ['T01', 'T02', 'T03', 'T04']); assert.equal(matches[0].matchId, 'T04'); });
check('Sport/day filtering and match lookup', () => { assert.equal(filterMatches(matches, 'chess', 1).length, 0); assert.equal(filterMatches(matches, 'volleyball', 2).length, 0); assert.equal(filterMatches(matches, 'volleyball', 1).length, 4); assert.equal(findMatch(matches, 'T02').status, 'LIVE'); assert.equal(findMatch(matches, 'missing'), undefined); });
check('Scroll priority including simultaneous LIVE matches', () => { assert.equal(scrollTarget(matches).matchId, 'T02'); assert.equal(scrollTarget(matches.filter(({ status }) => status !== 'LIVE')).matchId, 'T04'); assert.equal(scrollTarget(matches.map((match) => ({ ...match, status: 'FINISHED' }))).matchId, 'T04'); assert.equal(scrollTarget([]), undefined); assert.equal(scrollTarget([fixture('T05', 'CANCELLED', '09')]), undefined); });
check('Statuses are never derived from elapsed scheduled times', () => { assert.equal(sortMatches([fixture('T06', 'UPCOMING', '09')])[0].status, 'UPCOMING'); });
check('Filtering optional criteria and sorting equivalent offset timestamps preserve input', () => {
  const input = [fixture('B', 'FINISHED', '10', { scheduledAt: '2026-12-05T09:00:00Z' }), fixture('A', 'UPCOMING', '10')];
  assert.deepEqual(filterMatches(input).map(({ matchId }) => matchId), ['A', 'B']);
  assert.equal(input[0].matchId, 'B');
  assert.equal(filterMatches(input, 'volleyball', '1').length, 0);
});
check('Mixed finished/cancelled/postponed schedules do not invent a scroll target', () => {
  const input = [fixture('A', 'FINISHED', '09'), fixture('B', 'CANCELLED', '10'), fixture('C', 'POSTPONED', '11')];
  assert.equal(scrollTarget(input), undefined);
  assert.equal(scrollTarget([]), undefined);
});
const aborted = new AbortController();
aborted.abort();
await assert.rejects(getMatches({ signal: aborted.signal }), { name: 'AbortError' });
console.log('PASS provider rejects an already-aborted request'); checks++;
assert.deepEqual(await getMatches(), []);
console.log('PASS production provider is empty'); checks++;
check('Development mock fixtures cover all sports, days, statuses, lineups, logos, and unique IDs', () => {
  assert.equal(new Set(mockMatches.map(({ matchId }) => matchId)).size, mockMatches.length);
  for (const sport of ['volleyball', 'basketball', 'futsal', 'badminton', 'chess']) {
    const fixtures = mockMatches.filter((match) => match.sport === sport);
    assert.deepEqual([...new Set(fixtures.map(({ day }) => day))], [1, 2]);
    assert.ok(fixtures.some((match) => match.status === 'UPCOMING' && match.scoreA == null && match.scoreB == null));
    assert.ok(fixtures.some((match) => match.status === 'FINISHED' && Number.isFinite(match.scoreA) && Number.isFinite(match.scoreB)));
    const live = fixtures.filter(({ status }) => status === 'LIVE');
    assert.equal(live.length, 2);
    assert.equal(live[0].scheduledAt, live[1].scheduledAt);
    assert.ok(fixtures.some((match) => !match.teamA.players || !match.teamB.players));
    assert.ok(fixtures.some((match) => !match.teamA.logo || !match.teamB.logo));
    assert.ok(fixtures.some((match) => match.teamA.players?.[1].isCaptain && match.teamB.players?.[1].isCaptain));
    assert.ok(fixtures.every((match) => Number.isFinite(Date.parse(match.scheduledAt))));
  }
  assert.ok(findMatch(mockMatches, 'VB02'));
});

// Vite parses project JSX in .js files; SSR checks markup, not browser effects.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.js');
  const { MatchCard, TeamLineup, TeamLogo } = await vite.ssrLoadModule('/src/components/Matches/MatchComponents.js');
  const { MatchScoreboard } = await vite.ssrLoadModule('/src/pages/MatchesPage/BattlePage.js');
  const markup = (component, props) => renderToStaticMarkup(React.createElement(StaticRouter, { location: '/matches' }, React.createElement(component, props)));
  check('Both routes render within existing layout with active Schedule link', () => {
    for (const url of ['/matches', '/matches/unknown']) {
      const html = render(url);
      assert.match(html, /class="active" href="\/matches"/);
      assert.match(html, /class="footer/);
      assert.doesNotMatch(html, /Test Team/);
    }
    assert.match(render('/matches'), /Matches &amp; Results/);
  });
  check('Missing logos render neutral shields; supplied logos are respected', () => { assert.match(markup(TeamLogo, { team: matches[0].teamA }), /logo unavailable/); assert.match(markup(TeamLogo, { team: { name: 'Test', logo: '/test-logo.png' } }), /src="\/test-logo.png"/); });
  check('Lineups use supplied captain and handle unavailable players', () => { const html = markup(TeamLineup, { team: matches[0].teamA }); assert.match(html, /Captain Player<\/span><span class="battle-page__captain"/); assert.doesNotMatch(html, /First Player<\/span><span class="battle-page__captain"/); assert.match(markup(TeamLineup, { team: matches[0].teamB }), /Lineup not available yet/); });
  check('Scoreboard handles zero and absent scores, with explicit status', () => { const html = markup(MatchScoreboard, { match: { ...matches[0], scoreA: 0, scoreB: 2 } }); assert.match(html, /Score: 0 to 2/); assert.match(markup(MatchScoreboard, { match: matches[0] }), /Score: not available to not available/); });
  check('All five statuses and simultaneous LIVE cards render normally', () => { for (const status of ['LIVE', 'UPCOMING', 'FINISHED', 'POSTPONED', 'CANCELLED']) assert.match(markup(MatchCard, { match: fixture('TEST', status, '10'), selection: { sport: 'volleyball', day: 1 } }), new RegExp(`matches-status--${status.toLowerCase()}`)); for (const match of matches.filter(({ status }) => status === 'LIVE')) assert.match(markup(MatchCard, { match }), /matches-match-card--live/); });
  check('All configured static routes and the dynamic match route render', () => {
    const routes = ['/', '/matches', '/matches/unknown', '/merchandise', ...sports.map(({ slug }) => `/sports/${slug}`), ...merch.map(({ slug }) => `/merchandise/${slug}`)];
    for (const route of routes) assert.match(render(route), /<main>/);
  });
} finally { await vite.close(); }
console.log(`${checks} checks passed.`);

