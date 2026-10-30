// All countdown dates live here.
// Date format: 'YYYY-MM-DDTHH:MM:SS+01:00'  (+01:00 = German winter time / CET, +02:00 = summer time)
//
// Each entry has an opening (`start`) and, optionally, a closing (`end`) date. Every timer switches
// by itself, no editing needed when a date passes:
//   before `start`        -> counts down to `start`, caption `labels.before`
//   between start and end -> counts down to `end`,   caption `labels.during`
//   after the last date   -> shows `doneText` instead of a timer
//
// `hero: true` entries take turns in the hero section: it shows the first one that isn't over yet.
const countdowns = [
  {
    id: 'registration',   // players: hero, sport pages, phone bar
    start: '2026-11-01T18:00:00+01:00',
    end:   '2026-11-22T23:59:00+01:00',
    labels: { before: 'Registration opens in', during: 'Registration closes in' },
    doneText: 'Registration is closed.',
    hero: true,
  },
  {
    id: 'vendor-registration',   // vendors section
    start: '2026-11-01T18:00:00+01:00',
    end:   '2026-11-29T23:59:00+01:00',
    labels: { before: 'Vendor registration opens in', during: 'Vendor registration closes in' },
    doneText: 'Vendor registration is closed.',
  },
  {
    id: 'merch-presale',   // merch section and merch pages
    start: '2026-10-31T20:00:00+01:00',
    end:   '2026-12-01T23:59:00+01:00',
    labels: { before: 'Merch presale opens in', during: 'Merch presale ends in' },
    doneText: 'The merch presale has ended.',
  },
  {
    id: 'tournament',
    start: '2026-12-05T09:00:00+01:00',   // TODO: confirm the start time
    labels: { before: 'The Games begin in' },
    doneText: 'The Games are on!',
    hero: true,
  },
];

export const getCountdown = (id) => countdowns.find((c) => c.id === id);

// Where an entry stands at `now`: { label, date } to count down to, or { done: true }.
export const countdownPhase = (c, now) => {
  if (now < new Date(c.start)) return { label: c.labels.before, date: c.start };
  if (c.end && now < new Date(c.end)) return { label: c.labels.during, date: c.end };
  return { done: true };
};

// Is the window between start and end open right now? (e.g. to switch on a form button)
export const isOpen = (id, now) => {
  const c = getCountdown(id);
  return now >= new Date(c.start) && (!c.end || now < new Date(c.end));
};

// First hero countdown that isn't over yet, or the last one once all are
export const nextHeroCountdown = (now) => {
  const list = countdowns.filter((c) => c.hero);
  return list.find((c) => !countdownPhase(c, now).done) || list[list.length - 1];
};

export default countdowns;
