// Fictional development fixtures only. The provider imports this module lazily
// behind both Vite's DEV guard and the explicit VITE_USE_MOCK_MATCHES=true flag.
// Names, logos, players, and results below do not represent tournament entries.

function demoLogo(initials) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#70191D" stroke="#FECD6D" stroke-width="3"/><text x="32" y="39" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#F5F0E5">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function demoTeam(id, name, size, { logo = true, lineup = true } = {}) {
  return {
    id,
    name: `Demo ${name}`,
    ...(logo ? { logo: demoLogo(name.split(' ').map((word) => word[0]).join('')) } : {}),
    // Put the captain second so visual checks cannot rely on the first-player rule.
    ...(lineup ? { players: Array.from({ length: size }, (_, index) => ({
      id: `${id}-player-${index + 1}`,
      name: `${name.split(' ')[0]} Player ${index + 1}`,
      isCaptain: index === 1,
    })) } : {}),
  };
}

const sports = [
  { sport: 'volleyball', prefix: 'VB', size: 8, scores: [3, 1], court: 'Demo Court A' },
  { sport: 'basketball', prefix: 'BB', size: 10, scores: [120, 115], court: 'Demo Court B' },
  { sport: 'futsal', prefix: 'FT', size: 7, scores: [4, 2], court: 'Demo Court C' },
  { sport: 'badminton', prefix: 'BD', size: 2, scores: [2, 0], court: 'Demo Court D' },
  { sport: 'chess', prefix: 'CH', size: 4, scores: [2.5, 1.5], court: 'Demo Chess Hall' },
];

// Every sport has both days, unknown scores, finished results, simultaneous LIVE
// fixtures, complete/nonexistent rosters, and supplied/missing team logos.
const mockMatches = sports.flatMap(({ sport, prefix, size, scores, court }) => {
  const harbor = demoTeam(`${prefix}-harbor`, 'Harbor Comets', size);
  const forest = demoTeam(`${prefix}-forest`, 'Forest Owls', size);
  const copper = demoTeam(`${prefix}-copper`, 'Copper Foxes', size, { logo: false, lineup: false });
  const silver = demoTeam(`${prefix}-silver`, 'Silver Kites', size, { logo: false });
  const fixture = (number, day, time, status, teamA, teamB, score) => ({
    matchId: `${prefix}${String(number).padStart(2, '0')}`,
    sport,
    day,
    scheduledAt: `2026-12-0${day + 4}T${time}:00+01:00`,
    stage: number < 5 ? 'Group Stage' : 'Semifinal',
    court,
    status,
    teamA,
    teamB,
    // Omit scores entirely for upcoming fixtures, rather than inventing 0–0.
    ...(score ? { scoreA: score[0], scoreB: score[1] } : {}),
  });
  return [
    // Earlier/later fixtures make the LIVE target genuinely scrollable on tall
    // screens too; dates stay fixed and statuses remain explicitly supplied.
    fixture(7, 1, '08:00', 'FINISHED', harbor, forest, [2, 1]),
    fixture(8, 1, '08:15', 'FINISHED', silver, harbor, [12, 10]),
    fixture(9, 1, '08:30', 'FINISHED', harbor, copper, [21, 19]),
    fixture(10, 1, '08:45', 'FINISHED', forest, silver, [105, 98]),
    fixture(1, 1, '09:00', 'FINISHED', harbor, copper, scores),
    fixture(2, 1, '11:30', 'LIVE', harbor, forest, [1, 0]),
    fixture(3, 1, '11:30', 'LIVE', copper, silver, [0, 0]),
    fixture(4, 1, '14:00', 'UPCOMING', forest, copper),
    fixture(11, 1, '15:00', 'UPCOMING', harbor, silver),
    fixture(12, 1, '16:00', 'UPCOMING', forest, harbor),
    fixture(5, 2, '10:00', 'FINISHED', silver, harbor, scores),
    fixture(6, 2, '13:00', 'UPCOMING', forest, silver),
  ];
});

export default mockMatches;
