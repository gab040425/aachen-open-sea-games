// All countdown dates live here.
// Date format: 'YYYY-MM-DDTHH:MM:SS+01:00'  (+01:00 = German winter time, +02:00 = summer time)
// `hero: true` entries take turns in the hero section: it always shows the next
// upcoming one, and moves on by itself when a date has passed.
const countdowns = [
  {
    id: 'registration',
    label: 'Registration opens in',
    date: '2026-11-01T00:00:00+01:00',
    doneText: 'Registration is open!',
    hero: true,
  },
  {
    id: 'merch-presale',
    label: 'Merch presale ends in',
    date: '2026-11-22T23:59:00+01:00',   // TODO: confirm the presale end date
    doneText: 'The merch presale has ended.',
    hero: true,
  },
  {
    id: 'tournament',
    label: 'The Games begin in',
    date: '2026-12-05T09:00:00+01:00',   // TODO: confirm the start time
    doneText: 'The Games are on!',
    hero: true,
  },
];

export const getCountdown = (id) => countdowns.find((c) => c.id === id);

// Next upcoming hero countdown, or the last one once all have passed
export const nextHeroCountdown = (now) => {
  const list = countdowns.filter((c) => c.hero).sort((a, b) => new Date(a.date) - new Date(b.date));
  return list.find((c) => new Date(c.date) > now) || list[list.length - 1];
};

export default countdowns;
