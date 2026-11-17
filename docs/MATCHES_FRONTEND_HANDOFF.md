# Matches Frontend Developer Handoff

This document describes the current frontend and the work required to connect it to a Vercel API backed by a private Google Sheet. It assumes basic JavaScript and React knowledge. Code examples in this document are illustrative; no API, authentication, caching, or automatic refresh is implemented by them.

## A. Architecture Overview

Intended data flow:

```text
Private Google Sheet: Teams + Players + Matches (ID references)
        |
        v
Vercel API: validate IDs, join teams/players into matches, cache ~60 seconds
        |
        v
getMatches({ signal }): request API, check/validate the response
        |
        v
useMatches(): expose matches, loading, error, retry
        |
        +--> MatchesPage: filter sport/day, sort, render cards
        |
        `--> BattlePage: find matchId, render scoreboard and lineups
```

**Implemented:** React routes/pages, reusable display components, default-empty async provider with opt-in development mocks, loading/error/retry states, sport persistence, Berlin day/time handling, chronological helpers, initial/selection scrolling, responsive sticky schedule controls, Battle Page routing, and isolated fixture/browser verification.

**Not implemented:** Sheets access, an `/api/matches` endpoint, backend authentication, backend cache, runtime response validation, polling/background refresh, shared client caching, or any live-score transport. `getMatches()` resolves `[]` by default and in production, so production shows an unpublished schedule and unknown match states rather than fictional results.

Both pages use the same provider/hook implementation but own separate hook instances. Navigating from the overview to a Battle Page starts another loading cycle. No context/query client shares the loaded array.

The spreadsheet is normalized storage; the API response is a joined, nested read model for the existing UI. Teams and player details are maintained once in their own tabs. Matches stores only team IDs. The future API resolves those relationships before returning data; MatchCard, BattlePage, and the development mock dataset keep their existing `teamA`/`teamB` objects. No frontend code changes are necessary for this contract update.

### Development-only mock mode

Mock mode is **off by default**. To enable it, create or edit `.env.development.local` at the repository root and add:

```dotenv
VITE_USE_MOCK_MATCHES=true
```

Restart `npm run dev` after changing environment variables. Open `/matches`, select any sport/day, or open `/matches/VB02` directly for a complete volleyball Battle Page. Mock teams have a `Demo` prefix and are fictional.

To disable it, remove the entry or set `VITE_USE_MOCK_MATCHES=false`, then restart the dev server. The normal provider returns to `[]`. The flag must be exactly the string `true`; other values do not enable mocks. No env file was created or existing env file modified by this implementation.

For a temporary PowerShell session without an env file:

```powershell
$env:VITE_USE_MOCK_MATCHES = 'true'
npm.cmd run dev
# After stopping the server, disable the flag for this shell:
Remove-Item Env:VITE_USE_MOCK_MATCHES
```

The provider requires **both** `import.meta.env.DEV` and the explicit flag. Production builds/previews do not use mock data even if the flag is set. A lazy import keeps the mock module out of the normal production bundle. Vite dev servers expose source modules to their users; keep these fixtures fictional and never put secrets in them. The VITE variable is a public switch, not a credential.

`src/data/matches.mock.js` contains 60 fixtures: twelve per sport (ten on Day 1 and two on Day 2). Earlier FINISHED matches and later UPCOMING matches make the LIVE target meaningfully scrollable even on tall screens. Each sport still has two simultaneous LIVE matches and both days. Upcoming scores are omitted. Some teams have inline fictional monogram logos; others use the normal neutral shield. Some rosters are missing; complete rosters place captains second.

| Sport | Complete LIVE Battle Page | Missing logo/lineup example | Day 2 upcoming |
|---|---|---|---|
| Volleyball | `/matches/VB02` | `/matches/VB01` | `/matches/VB06` |
| Basketball | `/matches/BB02` | `/matches/BB01` | `/matches/BB06` |
| Futsal | `/matches/FT02` | `/matches/FT01` | `/matches/FT06` |
| Badminton | `/matches/BD02` | `/matches/BD01` | `/matches/BD06` |
| Chess | `/matches/CH02` | `/matches/CH01` | `/matches/CH06` |

Mocks are fixed scenarios, not a simulation: timestamps do not change statuses and scores do not update automatically. If the current Berlin date defaults to Day 2, select Day 1 to see simultaneous LIVE fixtures. Both overview and Battle Pages call the same getMatches provider, so mock mode never requires hardcoding teams into UI components.

## B. File Structure

Paths below are relative to the repository root. The original feature remains working-tree work; this list describes files added/modified across the feature and its documentation, not a committed release.

### Feature source files added

| File | Responsibility and dependents |
|---|---|
| `src/data/matches.js` | Provider integration point, sport descriptors/storage key, validation of sport preference, Berlin day/time helpers, filter/sort/lookup/scroll-target policy. Imported by pages, hook, shared components, and tests |
| `src/data/matches.mock.js` | Fictional fixtures across all sports/days, synthetic team logos, and representative lineups/statuses. Lazily imported only when the development-only mock flag is enabled; also inspected by fixture tests |
| `src/components/Matches/useMatches.js` | Async provider lifecycle, result/error/loading, cancellation, manual retry. Used by both pages |
| `src/components/Matches/useScheduleLayout.js` | Measures navbar/control geometry, tracks scroll direction without React state, controls reveal/hide and automatic scroll completion, and cleans up listeners/observers/animation frames. Used only by MatchesPage |
| `src/components/Matches/MatchComponents.js` | TeamLogo, MatchStatusBadge, MatchScore, MatchTeam, MatchCard, MatchesState, TeamLineup. Used by pages and tests; sport selector buttons display text only |
| `src/pages/MatchesPage/MatchesPage.js` | Overview controls/state, internal MatchList/ref scrolling, data filtering, bracket/empty/loading/error branches. Routed by App |
| `src/pages/MatchesPage/BattlePage.js` | One reusable BattlePage route component and MatchScoreboard composition. Routed by App |
| `src/pages/MatchesPage/Matches.css` | All new feature styling, including sticky wrapper and responsive overrides. Imported by both pages; selectors are feature-scoped |

### Supporting files added

| File | Responsibility |
|---|---|
| `scripts/test-matches.mjs` | 17 pure-helper/SSR rendering check groups, including coverage of the development dataset |
| `scripts/test-matches-browser.mjs` | Seven normal local headless Chrome groups, plus four actual mock-mode groups with `--mock`. Normal groups force the flag off and retain their isolated fixture injection |
| `docs/MATCHES_FRONTEND_HANDOFF.md` | This current integration guide |

### Existing files modified by the original feature

| File | Change |
|---|---|
| `src/App.js` | Imports the two pages and declares `/matches` plus `/matches/:matchId` |
| `src/components/Navbar/Navbar.js` | Adds Schedule immediately after Sports using existing Link rendering and active-prefix logic |
| `scripts/prerender.mjs` | Prerenders the overview and emits an empty-root `dist/matches-shell.html` for dynamic Battle Pages |
| `vercel.json` | Routes `/matches/[^/]+/?` to that shell after filesystem handling and before the existing general fallback |

No dependencies or npm scripts were added/changed. `src/App.css`, fonts, navbar CSS, DitherWave/global background, footer, and unrelated pages remain unchanged. The current sticky addition changes only feature files/tests/docs; it does not require another Navbar modification.

## C. Data Contract

### Response shape

`getMatches({ signal })` must resolve a **bare array** of normalized match objects:

```js
[matchObject, anotherMatchObject]
```

An empty array is a valid successful response. Do not pass `{ matches: [...] }`, `{ teams, players, matches }`, Sheets row arrays, null, or spreadsheet metadata directly to the hook. The proposed endpoint returns a joined bare array. If another endpoint envelope is agreed later, unwrap it inside getMatches before returning. The endpoint name below is a proposed integration convention, not an existing route.

### Normalized Google Sheets source: three tabs

All examples below are fictional documentation rows, not data published by this site. Column names below are the exact proposed tab headers. Header names identify fields; frontend components must never depend on column order or row numbers.

**Teams**

| teamId | teamName | sport | logo |
|---|---|---|---|
| VB_HARBOR | Example Harbor | volleyball | /images/teams/example-harbor.png |
| VB_FOREST | Example Forest | volleyball | |

**Players**

| playerId | teamId | playerName | isCaptain |
|---|---|---|---|
| P001 | VB_HARBOR | Example Player | FALSE |
| P002 | VB_HARBOR | Example Captain | TRUE |

Example Forest has no Players rows, deliberately demonstrating an unavailable lineup. Its blank logo also demonstrates the existing shield fallback.

**Matches**

| matchId | sport | teamAId | teamBId | scheduledAt | stage | court | status | scoreA | scoreB |
|---|---|---|---|---|---|---|---|---|---|
| VB02 | volleyball | VB_HARBOR | VB_FOREST | 2026-12-05T11:30:00+01:00 | Quarterfinal | Court B | FINISHED | 2 | 1 |
| VB03 | volleyball | VB_HARBOR | VB_FOREST | 2026-12-06T13:00:00+01:00 | Semifinal | Court B | UPCOMING | | |

Do not add repeated team names, logos, player lists, or captain names to Matches. A team rename or logo update is made once in Teams; later API snapshots apply it to every referencing match. Updating Players similarly changes each referencing team's joined lineup after refresh.

### Keys, relationships, and cell types

- `Teams.teamId`, `Players.playerId`, and `Matches.matchId` are primary keys: unique within the complete respective tab, not only within a sport/roster. IDs are stable, nonempty, trimmed, case-sensitive strings. Store ID columns as plain text to preserve leading zeros. Do not join using display names or spreadsheet row numbers.
- `Players.teamId` is a foreign key to Teams.teamId. `Matches.teamAId` and teamBId are foreign keys to the same team index. Each team belongs to exactly one supported sport. If a club enters multiple sports, give each sport registration a distinct teamId. One person registered in multiple teams needs distinct player/registration IDs in this schema; cross-team person identity is not modeled here.
- Required strings: teamName, playerName, sport, scheduledAt, stage, court, status, and all primary/foreign keys. A wholly blank row can be ignored; partially populated rows must be validated, not silently discarded.
- `logo` is optional; normalize a blank cell to omitted/empty string. A present value must follow the agreed acceptable URL/path policy. It is never inferred from a name or country.
- `isCaptain` becomes a real boolean. Accept Sheets checkbox booleans or explicit case-normalized TRUE/FALSE text; a blank may default to false. Reject other nonblank values unless an explicit mapping is agreed. Never use Boolean("FALSE"), which evaluates to true.
- `scoreA`/scoreB are optional finite nonnegative numbers. Normalize blanks to null, not zero; preserve explicit 0. Parse validated numeric strings deliberately, including decimals used by the basic chess score display. Reject nonnumeric/nonfinite/negative values rather than guessing.
- `scheduledAt` must identify an instant with an explicit offset or Z. Match/Team sport must be one of the supported lowercase IDs. Status must normalize to one supported uppercase enum without clock inference.
- There is no roster-order column in the proposed Players tab. Preserve validated row order for display for now; changing order must not change captaincy. Add an explicit future order field only if a durable independent roster ordering is required.

### Future API join: implementation responsibility

The following algorithm is a contract for the next backend developer, not implemented endpoint code:

1. Retrieve all three tabs in one logical publication snapshot. Google Sheets does not become a transactional database merely because requests are batched; validate the assembled snapshot and do not publish half of a failed/inconsistent join.
2. Normalize cells and validate primary keys **before** building maps. Reject duplicate IDs, including identical duplicate rows; inserting them directly into a Map would silently choose a winner.
3. Build `teamsById` keyed by teamId. Initialize a player array for every valid team. Validate each player row and its team reference, then append `{ id: playerId, name: playerName, isCaptain: boolean }` to that team's array.
4. For every Match row, resolve teamAId and teamBId in teamsById. Reject unresolved IDs, self-matches, or either team's sport differing from the match sport.
5. Build each nested team as `{ id: teamId, name: teamName, logo, players }`, omitting empty optional logo and supplying `players: []` if that valid team has no player rows. The source team's sport is used for validation; the existing nested team object does not need a new sport field.
6. Copy matchId/sport/scheduledAt/stage/court/status and normalized scores. Derive numeric day from the **Europe/Berlin calendar date of scheduledAt**: December 5, 2026 -> 1, December 6 -> 2. Reject other tournament dates. An instant such as `2026-12-05T23:30:00Z` is December 6 in Berlin and therefore Day 2.
7. Return the joined Match[] in the expected nested shape shown below. Repeating a team's nested read model across response matches is intentional; only the spreadsheet storage avoids duplication. No additional frontend joins are needed.

Do **not** use defaultMatchDay() for step 6: it selects the UI's initial day from the current date, not the fixture's day. The source Matches tab has no day column, so derivation is an API responsibility. The browser continues to use the returned numeric day for filtering and Berlin time for display.

| Source field/relationship | Output field |
|---|---|
| Matches.matchId, sport, scheduledAt, stage, court, status | Same-named match fields |
| Berlin calendar date of Matches.scheduledAt | match.day (number 1 or 2) |
| Matches.scoreA/scoreB | match.scoreA/scoreB (number or null) |
| Matches.teamAId -> Teams.teamId | match.teamA.id |
| Matched Teams.teamName / logo | match.teamA.name / optional logo |
| Players where teamId equals teamAId | match.teamA.players |
| Matches.teamBId -> Teams, then Players by teamId | Same mapping for match.teamB |
| Players.playerId / playerName / parsed isCaptain | player.id / name / boolean isCaptain |

### Referential errors versus permitted missing data

| Condition | Future API policy | Existing frontend outcome |
|---|---|---|
| Missing/blank match team ID, or ID absent from Teams | Reject snapshot; return non-success response | Provider rejects; generic loading-error/retry UI, not an invented team |
| Duplicate teamId, playerId, or matchId | Reject before indexing; never silently first/last-wins | Provider error/retry; no ambiguous links, keys, or roster entries |
| Player references missing/unknown teamId | Reject snapshot as orphan reference | Provider error/retry; do not silently lose players |
| Required playerId/name absent or malformed nonblank captain flag | Reject snapshot | Provider error/retry |
| Both match IDs reference same team, or sport mismatch | Reject snapshot | Provider error/retry |
| Valid team has no Players rows | Return its players as [] | “Lineup not available yet.” |
| Players tab missing/unreadable or request fails | Integration error, not empty rosters | Provider error/retry; retain no false successful result |
| Valid team has blank/missing optional logo | Omit logo or return empty string | Neutral shield; a broken supplied URL also falls back client-side |
| Blank score cell | Return null (or omit) | Dash; explicit numeric zero stays zero |
| Valid empty Matches tab with valid tab reads | Return [] | Schedule coming soon |

Reject the assembled publication snapshot for referential/validation errors rather than silently skipping broken matches or returning [] as success. Send operational diagnostics to appropriate server logs using tab/row/ID references, without exposing private sheet contents or credentials to visitors. A future last-known-good backend cache can use a separately documented failure policy; it must not label a partially joined result as a complete fresh snapshot.

No captain is guessed when data is missing. Zero captain flags means no badge; multiple flags currently produce multiple badges. A future one-captain policy must be validated explicitly rather than silently selecting the first player. Duplicate display names are permitted; unique IDs remain authoritative.

### Match fields

| Field | JavaScript type | Required? | Illustrative value | Frontend use |
|---|---|---|---|---|
| `matchId` | string | Yes, unique/nonempty | `VB02` | Dynamic URL, exact lookup, React keys, data-match-id scroll target, display |
| `sport` | string enum | Yes | `volleyball` | Sport filtering, Battle Page sport label |
| `day` | number, 1 or 2 | Yes, derived by API | `1` | Tournament day filtering and metadata; not a string |
| `scheduledAt` | string, ISO timestamp with offset | Yes | `2026-12-05T11:30:00+01:00` | Chronological ordering, Berlin time display, time element datetime |
| `stage` | string | Yes | `Quarterfinal` | Card/Battle Page tournament stage |
| `court` | string | Yes | `Court B` | Venue metadata |
| `status` | string enum | Yes | `FINISHED` | Exact badge text, status class, scroll eligibility |
| `teamA` | object | Yes | See team fields | First displayed team and lineup |
| `teamB` | object | Yes | See team fields | Second displayed team and lineup |
| `scoreA` | nonnegative finite number, or null | Optional | `2`, `0`, or `null` | Basic first-team score; absent/null becomes dash |
| `scoreB` | nonnegative finite number, or null | Optional | `1`, `0`, or `null` | Basic second-team score; absent/null becomes dash |

### Team fields (`teamA` and `teamB`)

| Field | Type | Required? | Illustrative value | Frontend use |
|---|---|---|---|---|
| `id` | string | Yes, stable | `team-a` | Contract identity for future data integration; current UI primarily displays name/logo |
| `name` | string | Yes | `Example Team A` | Card, heading, scoreboard, lineup title, accessible logo names |
| `logo` | string URL/path | Optional | `/images/teams/example-a.png` | Exact image source; no country/name inference |
| `players` | array of player objects | Optional | See example | Roster display in supplied order |

Normalize empty logo cells to an absent value/empty string, and missing lineups to `[]` or an absent field. Current rendering also tolerates null for logo/players, but the recommended normalized contract uses strings/arrays when present. Do not send arbitrary objects as logo/players.

### Player fields

| Field | Type | Required? | Illustrative value | Frontend use |
|---|---|---|---|---|
| `id` | string | Yes; maps the unique source playerId | `player-a1` | Stable React row key |
| `name` | string | Yes | `Example Player` | Displayed roster name |
| `isCaptain` | boolean | Supply for each normalized player; absent is treated as false | `true` or `false` | Gold C badge wherever true; first player is not assumed captain |

### Supported values and dates

Sports: `volleyball`, `basketball`, `futsal`, `badminton`, `chess`.

Statuses: `UPCOMING`, `LIVE`, `FINISHED`, `POSTPONED`, `CANCELLED`. These uppercase strings are the interface, not translated display labels. The API should reject/map invalid input before returning normalized data.

Day 1 is December 5, 2026; Day 2 is December 6, 2026. Use offset timestamps such as `2026-12-05T11:30:00+01:00` or valid equivalent UTC instants with `Z`. Do not send timezone-less timestamps, localized dates, or separate spreadsheet serial numbers directly. Berlin formatting is done with Intl; the API must still provide the correct instant and a consistent numeric day.

The automatic initial day uses Berlin's calendar date: before December 6, Day 1; December 6 or later, Day 2. It is initialized on entry, not continuously forced after manual selection. Time formatting is 24-hour Berlin time for every visitor.

### Expected joined API JSON response (fictional example)

For the three tab examples above, the proposed endpoint returns this bare array. It intentionally repeats the resolved team read models while the spreadsheet stores each team once. Notice numeric day, actual boolean captain flags, null upcoming scores, absent optional logo, and an empty lineup.

```json
[
  {
    "matchId": "VB02",
    "sport": "volleyball",
    "day": 1,
    "scheduledAt": "2026-12-05T11:30:00+01:00",
    "stage": "Quarterfinal",
    "court": "Court B",
    "status": "FINISHED",
    "teamA": {
      "id": "VB_HARBOR",
      "name": "Example Harbor",
      "logo": "/images/teams/example-harbor.png",
      "players": [
        {
          "id": "P001",
          "name": "Example Player",
          "isCaptain": false
        },
        {
          "id": "P002",
          "name": "Example Captain",
          "isCaptain": true
        }
      ]
    },
    "teamB": {
      "id": "VB_FOREST",
      "name": "Example Forest",
      "players": []
    },
    "scoreA": 2,
    "scoreB": 1
  },
  {
    "matchId": "VB03",
    "sport": "volleyball",
    "day": 2,
    "scheduledAt": "2026-12-06T13:00:00+01:00",
    "stage": "Semifinal",
    "court": "Court B",
    "status": "UPCOMING",
    "teamA": {
      "id": "VB_HARBOR",
      "name": "Example Harbor",
      "logo": "/images/teams/example-harbor.png",
      "players": [
        {
          "id": "P001",
          "name": "Example Player",
          "isCaptain": false
        },
        {
          "id": "P002",
          "name": "Example Captain",
          "isCaptain": true
        }
      ]
    },
    "teamB": {
      "id": "VB_FOREST",
      "name": "Example Forest",
      "players": []
    },
    "scoreA": null,
    "scoreB": null
  }
]
```

Repeated team/player IDs across different matches in this JSON are expected: they identify the same source entities. Primary-key uniqueness is checked in the source tabs; matchId remains unique across the response. Do not reject repeated nested team/player IDs merely because a team appears in several matches.

### Missing values and validation ownership

- Missing/null score displays a dash, never a fabricated zero. Zero remains visible through nullish coalescing. Scores are not inferred from status and winners are not calculated.
- Missing or broken logo displays a neutral team shield. TeamLogo remembers its failed URL; a different URL can load, but the same failed URL is not repeatedly retried during that instance's lifetime.
- Missing/empty players displays “Lineup not available yet.” Roster length is unrestricted; captain placement comes only from the flag.
- Unknown match ID displays “Match not found,” not a homepage redirect.
- A failed provider request shows generic error/retry; a valid empty array shows unpublished/empty schedule copy.

**Runtime validation is not implemented.** The hook trusts resolved data; malformed arrays/statuses/timestamps/teams can cause rendering errors. Implement validation/normalization at the provider boundary before returning data. Required checks include array shape, unique IDs, supported enums, valid explicit-offset timestamps, numeric day, required nested objects/strings, finite nonnegative optional scores, boolean captain flags, actual player arrays, and acceptable logo URL schemes/origins. Reject malformed required data rather than inventing teams/statuses or silently publishing partial corrupt records.

## D. Connecting the Future Google Sheets API

### Integration steps

1. Build the private Sheets-to-Vercel backend separately. Read Teams, Players, and Matches; validate keys/references; join into the nested Match[] in section C; derive day in Berlin time. Keep credentials, sheet IDs, and access logic server-side. This documentation update has not created that endpoint.
2. Modify **`src/data/matches.js`**, specifically the normal empty-return path in **`getMatches({ signal })`**, marked with a TODO. Retain the existing DEV + explicit-flag branch if local mocks are still useful.
3. Request the already joined endpoint, pass the AbortSignal, reject non-success responses, parse JSON, and validate the nested bare-array response. Do not request three Sheet tabs or implement their relational joins inside React components.
4. Return that array. Existing useMatches callbacks then update page state; components need no spreadsheet knowledge.
5. Reject network, HTTP, JSON, and validation failures. useMatches catches them and both pages already expose generic retry UI. Do not convert failures to `[]`: that would disguise a broken service as an unpublished schedule.
6. Verify with approved nonproduction fixtures and a preview backend before publishing real records. Keep fixture injection separate from production.

### Illustrative provider replacement — documentation only

```js
// Proposed normal-source request for a future endpoint, NOT current source code.
// Keep the existing development-only mock branch before this request.
export async function getMatches({ signal } = {}) {
  const response = await fetch('/api/matches', { signal });
  if (!response.ok) {
    throw new Error(`Match request failed (${response.status})`);
  }

  const payload = await response.json();
  // Implement this adapter/validator before using this example.
  // It must return Match[] and throw on malformed required data.
  return normalizeAndValidateMatches(payload);
}
```

`normalizeAndValidateMatches` above does **not** exist in the application. It is a clearly named responsibility for the next developer, not a helper to import blindly. It should validate the already joined API response (and unwrap an agreed endpoint envelope if necessary). Sheet cell parsing and the three-tab join belong to the server, not this browser adapter. The example includes no spreadsheet ID, credentials, auth token, service-account key, or client-side Sheets request.

Use the same-origin `/api/matches` convention if that is the endpoint the backend actually creates. Browser CORS/cookie/header requirements are not currently defined; agree on them with the backend developer rather than assuming a public or authenticated API already exists.

### How consumers work

`useMatches()` defaults to the imported getMatches function. Its effect invokes the provider, stores successful matches, or stores a failure and clears loading. Cleanup aborts the controller and guards stale completions. Its Promise chain catches synchronous provider throws too. A stable provider identity avoids repeated effect-triggered requests.

MatchesPage memoizes `filterMatches(matches, sport, day)`, which filters strictly then returns a sorted copy. BattlePage uses `findMatch(matches, matchId)` on its own loaded array. Neither page receives raw Sheets rows. No component-level fetch calls need to be added.

### Testing the connection

Run the existing helper and browser scripts first. Then use a preview endpoint to test a valid populated array, empty array, network/HTTP failure, invalid JSON, malformed required fields, cancellation during navigation, and retry recovery. Confirm real scores/logos/lineups render in both routes, and refreshing a direct Battle Page URL loads through the configured shell. Inspect requests without printing credentials or private sheet content into public logs.

## E. Data Refresh Strategy — Future Work Only

The intended later architecture is a Vercel response backed by approximately **60 seconds of backend caching**, with frontend refresh approximately **every 60 seconds**. Neither cache nor interval is present today. Backend caching belongs on the server; the browser must not cache Sheets credentials or query the private Sheet directly.

### Recommended frontend lifecycle

Extend useMatches or introduce a shared query layer while retaining its normalized provider boundary:

1. Keep initial `loading` distinct from background `refreshing`. Initial load may show a placeholder; background refresh should retain the last successful matches.
2. Replace matches atomically after a successful validated response. Preserve current sport/day/view state; do not rerun browser-default initialization on data arrivals.
3. Keep the displayed list mounted during background refresh. Preserve stable match IDs and the page-owned scroll-completion state. Do not temporarily clear data or replace the list with loading markup.
4. Keep the completed initial-scroll guard. Background updates must not invoke automatic navigation; do not include refresh counters in keys.
5. Do not reset window scrollTop, push filter navigation, remount the whole page, or focus elements after a background response. Stable keys/layout reduce unnecessary movement; if schedule insertion changes content above the viewport, explicitly test native scroll anchoring and decide whether additional anchoring is necessary.
6. On background failure, retain last successful content and expose a nonblocking stale/error indication with a retry action. Do not silently present a failed refresh as an empty schedule or erase the Battle Page.
7. Abort/ignore obsolete requests on cleanup, avoid overlapping refreshes, and ensure a slower older response cannot replace a newer response. An await-completion/rearm timer or a query library can simplify this.
8. Clean up timer/controller on unmount and handle development StrictMode. Consider pausing while the tab is hidden and refreshing sensibly on return, according to backend load requirements.
9. Decide how to share responses across overview/Battle Page to avoid duplicated intervals and inconsistent snapshots. That sharing is not implemented now.

**Do not implement polling by calling the current `retry()` every minute.** Current retry sets loading and clears matches, which unmounts the list/Battle Page content and can cause layout movement. The page-owned scroll guard now prevents a repeat automatic scroll for the same selection. It is a manual full-load retry, not a safe background refresh action.

The automatic-scroll guard now belongs to MatchesPage and is keyed by sport/day. It survives list unmounts caused by tab toggles or retries. Only a sport/day change resets eligibility, including a change to a day with no matches. A full route unmount starts a fresh visit. Keep this policy when adding background refresh; retaining content is still necessary to avoid layout shifts.

### Backend responsibilities

Implement the approximately 60-second cache in the Vercel API with clear freshness/error semantics, protecting private-sheet access and avoiding request bursts. Choose cache scope, failure fallback, invalidation, and authentication separately with the backend owner. The frontend currently has no agreed response freshness fields or headers; document them when the API contract is finalized.

## F. Match Status and Sorting Rules

1. Status comes exclusively from the source's normalized status field. Time passing does not turn UPCOMING into LIVE or FINISHED.
2. All matching fixtures remain in one chronological list. Sort by actual scheduled instant, then lexicographic match ID for ties. Equal-time matches stay adjacent. Sorting copies arrays rather than mutating provider data.
3. Score/status changes do not affect ordering. Do not group completed/live/upcoming sections or add a NOW divider.
4. Initial scroll priority is earliest LIVE; otherwise first UPCOMING; otherwise last scheduled only when every match is FINISHED. Empty or mixed postponed/cancelled schedules without an eligible target do not scroll.
5. Multiple LIVE matches retain the same normal layout/status styling. Only initial scroll chooses the earliest; no special promoted card exists.
6. Current auto-scroll waits for browser preferences, font readiness, and two committed animation frames after route-to-top handling. It respects reduced motion and resets on explicit sport/day changes. Background updates to a retained mounted list must not re-scroll.
7. Automatic navigation hides the controls and centers below the measured visible navbar. Native focus/scrollIntoView margins account for controls only while they are revealed. Resizing remeasures offsets without automatically scrolling.

## G. Dynamic Routing

`/matches` renders the overview. `/matches/:matchId` renders one reusable BattlePage, with `useParams()` selecting the ID and findMatch selecting its data. For example, a card for ID VB02 links to `/matches/VB02`; the source constructs this as:

```jsx
<Link
  to={`/matches/${encodeURIComponent(match.matchId)}`}
  state={{ selection }}
>
  {/* MatchCard content */}
</Link>
```

This is an excerpt illustrating the existing MatchCard behavior, not a second card implementation. One Battle Page is enough because its heading, scoreboard, metadata, teams, and players are all driven by the selected match object. Do not create individual match source files.

Selection state carries sport/day back through the top All Matches link. With direct entry and valid data, the return link derives selection from the match. It does not preserve the previous tab or exact scroll pixel. The overview also remembers the sport in localStorage under `acop.matches.sport`.

The build prerenders `/matches` with its initial loading state and metadata. Dynamic IDs are not known at build time. `scripts/prerender.mjs` therefore writes an empty-root matches-shell.html, and vercel.json serves it for one match-ID segment before the generic homepage fallback. Existing client bootstrap uses createRoot for an empty root and hydrateRoot for prerendered markup; the dedicated shell avoids hydrating a Battle Page against the homepage. Verify this route on a preview host; local Vite browser tests do not prove Vercel routing.

The internal component/file is now `BattlePage` (`src/pages/MatchesPage/BattlePage.js`), and scoped detail-page classes use `battle-page`. The route remains `/matches/:matchId`; no `/battle` route was introduced. Shared feature styling remains in Matches.css, so there was no separate detail-page CSS file to rename.

## H. Styling Guidelines and Sticky Controls

**Preserve the global design system.** Do not edit `src/App.css`, global font imports/variables, DitherWave/background, navbar CSS, footer, or unrelated components to adjust the match layout. Use existing tokens, fonts, and container. Do not add global element selectors or another reset.

Safe feature stylesheet: **`src/pages/MatchesPage/Matches.css`**, imported by both pages. All new selectors use matches-/battle-page prefixes. Desktop card/Battle Page styling is shared and unchanged by the sticky addition; adjust scoped layout rules only when needed.

### Scroll-direction-aware schedule controls

MatchesPage wraps sport selection, tabs, and day selection in one .matches-controls region. CSS position:sticky retains normal document flow beneath the existing navbar; a local data-hidden attribute slides/fades the whole unit upward on downward scrolling and reveals it below the navbar on upward scrolling. At the normal-flow start it is visible; near the schedule end it hides rather than floating over other content. The existing navbar is permanently sticky and does not hide by direction, so no gap needs to be reserved for a hidden navbar.

useScheduleLayout receives page, controls, normal-flow start sentinel, and schedule panel refs. Its passive scroll listener queues at most one requestAnimationFrame; cumulative movement of at least 8px changes direction state. It mutates local DOM attributes/CSS properties, without React state updates on each scroll. ResizeObserver tracks navbar/control dimensions, and scrolling remeasures the navbar's visible bottom. Cleanup removes every listener, observer, and animation frame on unmount.

The panel's z-index 10 stays below the navbar/menu's existing 50. CSS transitions transform/opacity for .18s and delays visibility removal until the exit animation ends; prefers-reduced-motion disables transitions. A focused keyboard control remains visible; a reveal that would obscure the currently focused match card is suppressed. Buttons remain text-only and existing sport/day/tab handlers are preserved. Clicking an already selected control does not restart automatic navigation.

Local properties on the Matches page are --matches-navbar-offset (visible navbar bottom) and --matches-scroll-margin. The latter is max(0, navbarBottom + visibleControlsHeight + 16 - globalScrollPaddingTop), where hidden controls contribute zero. The measured global padding is subtracted for native focus/scrollIntoView clearance; no global variable, navbar CSS, or global scrolling rule is changed.

Automatic navigation instead computes a document Y coordinate from the target card's measured center and (viewportHeight + visibleNavbarBottom)/2. It hides controls before moving, so their transition cannot alter the desired center halfway through. It ensures the normal-flow controls have scrolled past the navbar, clamps to document scroll bounds, and uses smooth scrolling or instant for reduced motion. A frame-based settling guard prevents programmatic motion from being mistaken for user direction changes; wheel/touch/key input releases that guard immediately. No arbitrary long setTimeout is used.

Desktop retains sport buttons, tabs, and schedule header in their original order. At 860px and below the sport row scrolls horizontally, and phone controls stay compact. The panel remains scoped to the schedule and is removed on route exit.

### Automatic-scroll diagnosis and lifecycle fix

The previous pure priority helper already recognized supplied LIVE statuses. Reproduction with the real mocks confirmed a scroll request was issued; this was not a missing status/time transition. The old native-centering calculation reserved the full control height as though pinned, while the short desktop timeline could leave the controls in their normal position. In one 1280x900 reproduction, the controls remained at y=163..426 and the LIVE card center was about 628, while the actual available-viewport center was about 671. That mismatch and the short four-card Day 1 mock timeline made the result look like failed automatic navigation. Day 2 also legitimately has no LIVE fixtures and must use UPCOMING fallback.

The new direct geometry calculation, hidden-during-auto panel, font/layout readiness, page-owned guard, and longer mock timeline address these independently. The unchanged shared ScrollToHash still resets route navigation to the top; automatic positioning waits until after its effect rather than changing global route scroll behavior. A test selects Day 1 explicitly, so the real-world date never needs to equal the tournament date. Status remains exclusively data-authoritative.

### Score sizing and Battle Page naming

The previous card grid assigned only 90px/80px/74px to the score at desktop/tablet/phone widths. A nowrap double/triple-digit score could exceed those columns. Score columns now use max-content; the box itself has width:max-content, a minimum of calc(7ch + 24px), tabular numbers, and horizontal padding. Team columns use minmax(0,1fr), so long names wrap instead of squeezing the score.

On phones the card gap is 8px and the score remains between the teams. On a Battle Page below 600px, teams occupy two columns and the large status/score gets its own full-width second row. Existing fonts, colors, outlines, and score font-size rules remain intact. No clipping/ellipsis or tiny-font workaround is used.

Use /matches/VB07 for 2 - 1, VB08 for 12 - 10, VB09 for 21 - 19, VB10 for 105 - 98, and BB01 for 120 - 115. These are fictional development scenarios, not sport-specific scoring rules. Both card and Battle Page layouts are checked at 1280, 768, 390, and 320px. The component/file/import name is BattlePage and CSS detail selectors are battle-page; URLs stay unchanged.

### Scoped code cleanup (behavior preserved)

The Matches/Battle Page cleanup keeps the existing component exports, props, DOM structure, classes, data contract, and provider/mock interfaces. No CSS, routes, global components, or mock records were changed.

- MatchesPage now uses a local renderSchedule function with explicit bracket/loading/error/empty/list branches. Bracket precedence is unchanged. MATCH_VIEWS is shared by the tab markup and its named handleViewKeyDown handler.
- BattlePage uses a local renderMatch function with explicit loading/error/missing/success branches; its back link remains outside those branches. Shared match components use expanded JSX and TeamLogo uses an equivalent early-return image branch.
- Data helpers retain copy-before-sort, exact filters, deterministic ID ties, and LIVE/UPCOMING/all-FINISHED priority. Their steps are written explicitly rather than compressed into nested expressions.
- useScheduleLayout names its unchanged 16px clearance, 8px direction threshold, .5px settling tolerance, and three settling frames. A duplicate focus-overlap check in the direction branch was removed after confirming an earlier branch already handles it. The listener/observer lifecycle, animation-frame timing, and scroll geometry remain unchanged.
- Page readiness state, memoized filtering, the stable scroll callback, and page-owned scroll-completion refs remain in place because they protect hydration and scrolling behavior.

Verification includes 263 exact before/after rendered-markup comparisons, helper edge cases/provider abort handling, all configured route renders, native tab keyboard events, and the existing desktop/mobile scrolling and score-layout suites. The baseline contains fixed mock scenarios, not a tournament-clock simulator; no simulation feature was removed or added.

## I. Testing Checklist

### Commands and current coverage

```text
npm run build
node scripts/test-matches.mjs
node scripts/test-matches-browser.mjs
node scripts/test-matches-browser.mjs --mock
```

On PowerShell systems blocking npm.ps1, use `npm.cmd run build`. Browser tests need an installed Chrome; CHROME_PATH overrides the Windows default. They start an isolated local Vite server and disposable Chrome profile; no browser test library was installed. Normal browser groups force mock mode off and substitute test-only provider behavior. `--mock` instead enables the real development flag and uses the actual matches.mock.js source without the test fixture transform. Neither mode queries a real endpoint.

Latest scoped-refactor verification: production build passed with the mock flag deliberately set to true; emitted JS/HTML contained no mock module or fictional data. All 17 helper/SSR groups, seven normal browser groups, and four actual mock-mode groups passed. Browser tests check selected widths from 320px to 1600px, including direction-aware controls at 1280×900, 768×900, 390×740, and 320×700. This is local Chrome geometry/interaction coverage, not exhaustive accessibility/cross-browser/hosting verification.

### Integration acceptance checklist

- [ ] **API success:** approved populated response passes validation and renders cards/Battle Page, zero scores and real logos correctly. Future real-endpoint test; currently covered only with fixtures.
- [ ] **API failure:** network/HTTP/JSON/validation errors show generic retry, not empty success. Current fixture provider failure/recovery is tested; real endpoint remains future work.
- [ ] **Empty response:** valid `[]` shows schedule coming soon; controls remain usable. Covered locally.
- [ ] **Invalid data:** wrong response type, duplicate source primary keys, missing/unresolved team IDs, orphan players, self-matches, cross-sport references, unsupported sport/status, bad timestamp/day/team/player/score are rejected. Validation/join are not yet built. Reused nested team/player IDs across distinct matches must remain valid.
- [ ] **Three-tab join:** example rows produce the exact nested JSON in section C; changing one Teams name/logo updates all referencing matches after refresh; player edits affect the correct team only.
- [ ] **Derived day:** Berlin December 5 -> 1, December 6 -> 2, including a UTC timestamp crossing Berlin midnight; other dates reject.
- [ ] **Partial source failure:** a missing/unreadable tab rejects instead of publishing incomplete lineups or [] as false success. A valid team with no player rows still returns [].
- [ ] **Unknown match ID:** direct URL and reload show Match not found with a schedule link. Covered locally; verify production rewrite separately.
- [ ] **Missing logo:** absent and failed URLs use the neutral shield and do not change team identity. Covered with fixture markup/browser broken URL.
- [ ] **Missing lineup:** absent/empty roster shows its unavailable message; a non-first captain has the C badge. Covered with fixtures.
- [ ] **Simultaneous matches:** equal timestamps use stable ID ordering and remain adjacent. Helper coverage exists.
- [ ] **Multiple LIVE matches:** both receive normal LIVE styling; earliest chronological LIVE is initial target. Covered locally.
- [ ] **Chronology:** updating only score/status leaves time/ID order unchanged; source arrays remain unmutated. Helper policy is covered; add live-update coverage during refresh work.
- [ ] **Day selection:** test Berlin midnight boundary, both manual day switches, and no later automatic override. Helper boundary and browser controls are covered.
- [ ] **Sport persistence:** valid saved sport restores, invalid value falls back, blocked storage still allows filtering, horizontal row remains keyboard accessible. Valid/invalid persistence is covered; blocked storage/manual keyboard audit should be added.
- [ ] **Direction-aware controls:** scroll down to hide/up to reveal; hero leaves; revealed panel stays below nav; active controls are readable; nav menu stays above; route exit removes the region. Geometry/up-scroll/route exit are covered; manually inspect real-device menu behavior too.
- [ ] **Automatic scroll:** initial/filter selection chooses correct target below sticky panel; reduced motion is instant; same mounted-list rerenders do not repeatedly move the viewport. Covered locally; background-refresh preservation must be tested when implemented.
- [ ] **Mobile layout:** no page overflow, sport row scrolls rather than wrapping excessively, both days visible, target card readable. Covered at selected narrow widths; test actual devices/landscape/zoom too.
- [ ] **Future refresh:** after scrolling manually and selecting sport/day, successful/failed periodic refresh preserves both selections, focus, mounted content, and manual viewport position. Not implemented yet.
- [ ] **Global preservation:** git diff confirms App.css/fonts/background/navbar CSS/footer/unrelated pages unchanged; inspect shared nav at desktop/mobile boundaries.

## J. Known Limitations and Future Work

- Private Google Sheets integration and Vercel API are not implemented.
- Backend authentication, approximately 60-second caching, and frontend approximately 60-second refresh are not implemented.
- The normalized three-tab schema, referential validation, joins, and Berlin day derivation are documented future API responsibilities, not implemented code. Browser response validation is also still future work.
- Advanced sport-specific scoring, bracket generation/progression, and admin result editing are not implemented.
- LIVE means an explicit display status, not streaming results. No clock-derived status or winner calculation exists.
- Provider hooks do not share cached data between routes, retain stale data during retry, or provide background-refresh state.
- Scroll completion is page-owned and survives tab/retry remounts. Background refresh is still unimplemented; retain content during refresh to avoid layout movement.
- Day/view filters are not shareable query parameters; only sport is stored persistently. Return navigation carries sport/day but not exact previous scroll offset.
- Dynamic Battle Page metadata is generic/client-rendered. No real match IDs are prerendered and the Vercel rewrite has not been deployed by this work.
- Initial scroll waits for document fonts and committed frames, not arbitrary external image completion. Fixed logo boxes reduce shifts. Centering is clamped to real document bounds: very short schedules cannot always be perfectly centered.
- Use this handoff and current source as the integration references; older reports or session summaries may describe pre-sticky behavior.
- No dependencies were installed, no commit/push/merge was made, and no production deployment is part of this change.
