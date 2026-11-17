export const MATCH_SPORTS = [
  { id: 'volleyball', name: 'Volleyball' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'futsal', name: 'Futsal' },
  { id: 'badminton', name: 'Badminton' },
  { id: 'chess', name: 'Chess' },
];
// Store the stable sport ID rather than a display label that may change.
export const SPORT_STORAGE_KEY = 'acop.matches.sport';
// Stored values may be missing or outdated; always fall back to a supported sport.
export const validSport = (sport) => MATCH_SPORTS.some(({ id }) => id === sport) ? sport : 'volleyball';

export function defaultMatchDay(now = new Date()) {
  // Use the event's calendar date, regardless of the visitor's device timezone.
  // Padded year/month/day parts allow comparison without parsing localized text.
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}` >= '2026-12-06' ? 2 : 1;
}

// Copy before sorting to preserve provider data; IDs break simultaneous-start ties.
// Exclude status so score/status updates do not reorder the chronological schedule.
export const sortMatches = (matches) => [...matches].sort((a, b) => {
  const timeDifference = Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt);
  return timeDifference || a.matchId.localeCompare(b.matchId, 'en');
});
// Omitted/falsy criteria disable that filter; the contract uses numeric day values.
export const filterMatches = (matches, sport, day) => {
  const filtered = matches.filter((match) => (
    (!sport || match.sport === sport) && (!day || match.day === day)
  ));
  return sortMatches(filtered);
};
export const findMatch = (matches, id) => matches.find((match) => match.matchId === id);
export function scrollTarget(matches) {
  const ordered = sortMatches(matches);
  // Only supplied statuses count: scheduled time never makes a match LIVE.
  // Without LIVE/UPCOMING fixtures, target the last only if all are FINISHED.
  const live = ordered.find(({ status }) => status === 'LIVE');
  if (live) return live;

  const upcoming = ordered.find(({ status }) => status === 'UPCOMING');
  if (upcoming) return upcoming;

  if (ordered.length && ordered.every(({ status }) => status === 'FINISHED')) {
    return ordered.at(-1);
  }
  return undefined;
}
// The provider supplies valid offset timestamps; every sport displays Berlin time.
export const matchTime = (scheduledAt) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }).format(new Date(scheduledAt));

// Future API integration point. Return normalized Match[]; see docs/MATCHES_FRONTEND_HANDOFF.md.
// TODO: Connect the future Vercel API here; validate/normalize its response and
// forward signal to fetch. See docs/MATCHES_FRONTEND_HANDOFF.md for the contract.
// Mock fixtures are opt-in during development and excluded from production use.

export async function getMatches({ signal } = {}) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  // DEV is replaced by Vite at build time. Even a production environment with
  // VITE_USE_MOCK_MATCHES=true cannot activate this branch. The optional env access
  // also keeps pure Node helper tests working outside Vite.
  if (import.meta.env?.DEV && import.meta.env?.VITE_USE_MOCK_MATCHES === 'true') {
    const { default: mockMatches } = await import('./matches.mock.js');
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return mockMatches;
  }
  return [];
}
