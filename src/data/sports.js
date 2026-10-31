// All sport info lives here. The home page cards and each sport page
// (/sports/<slug>) are built from this list.
// To add a sport: copy one entry, give it a unique slug, put its photo in public/images/.
// Rules and matches: a plain string is one bullet; { title, items } is a sub-heading with its own bullets (can be nested).
// All details follow the final Player's Handbook (Google Drive link in data/links.js).

const sports = [
  {
    slug: 'badminton',
    name: 'Badminton',
    category: 'Racket sport',
    file: 'SportBadminton.jpg',
    format: 'Men’s Doubles  ·  Mixed Doubles',
    description: 'No longer the game you used to play at the park, but an intense battle of power and quick wits. Weapons made of the highest durability, fighting over something almost weightless, yet carries the violence of a thunderstorm and travels at subsonic speed.',
    requirementsTitle: 'Categories & team requirements',
    requirements: [
      'Only Men’s Doubles and Mixed Doubles',
      'Men’s Doubles: total of 12 teams, divided into 4 groups of 3 teams',
      'Mixed Doubles: total of 8 teams, divided into 2 groups of 4 teams',
      'Each team must assign 1 referee representative for the group and knockout games. Failure to do so will result in a €10 fine',
      'Each player can only participate in one of the categories due to schedule conflicts',
    ],
    matches: [
      {
        title: 'Group Stage',
        items: [
          'Each team plays against every other team in the same group once',
          'Match duration: 1 set, first to 30 points wins. 1-minute interval between the 11th and 21st point',
          'Points system: Win = 3 points, Draw = 1 point, Loss = 0 points',
          'Men’s Doubles: top 2 teams of each group advance to the knockout stage (8 teams in total)',
          'Mixed Doubles: top 2 teams of each group advance to the knockout stage (4 teams in total)',
          'If tied, the head-to-head result determines the ranking',
        ],
      },
      {
        title: 'Knockout Stage',
        items: [
          'Men’s Doubles: quarterfinals, semifinals and final',
          'Mixed Doubles: semifinals and final',
          'Match duration: best of three, each set first to 21 points. 1-minute break at the 11th point and 2-minute break between sets',
          'At 20-all the game goes into deuce: one side has to win by a two-point lead, up to a maximum of 30 (e.g. 22-20, 30-28, 30-29)',
        ],
      },
    ],
    rules: [
      'All matches follow BWF regulations',
      'If the shuttlecock touches the ceiling, it will be considered out of bounds, and the point goes to the opponent',
      'If the shuttlecock touches any indoor facility, the point is retaken',
      'Deliberately damaging or modifying the shuttlecock to slow down the game is prohibited',
      'Players are also prohibited from hitting the net, leaving the court without the referee’s permission, being rude or using offensive language',
      'If the participants cannot continue the game due to injury or other reasons, the team is declared the loser and the opposing team gets the win',
    ],
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    category: 'Team sport',
    file: 'SportBasketball.jpg',
    description: 'Like a heartbeat alive on hardwood, impossible to predict. The ball behaves like a thought, frantically passing from hand to hand, gradually gravitating towards tiny circles in the air. A chaotic drama of rubber squeaking, players hysterically racing between attack and defense, dashing to hear the swish of the net.',
    requirements: [
      'Total of 8 teams, divided into 2 groups of 4',
      'Each team must consist of a minimum of 5 players and a maximum of 12 players (5 core players + 7 substitutes)',
      'Each team must provide a minimum of 2 referees for the group stage and knockout games. Failure to provide referees will result in a €10 fine per game',
    ],
    matches: [
      {
        title: 'Group Stage',
        items: [
          'Each team plays against every other team in its group once (3 games per team)',
          'The top 2 teams from each group advance to the semifinals',
          'Match duration: 2 x 9 minutes',
          'Timeouts: each team is allowed 1 timeout per match, 1 minute long',
          'Points system: Win = 1 point, Loss = 0 points',
          'Tiebreaker: if tied in the standings, the team with the larger point difference ranks higher',
        ],
      },
      {
        title: 'Knockouts (Semifinals and Final)',
        items: [
          'The 4 teams advancing from the group stage compete in the semifinals; the 2 winners play the final',
          'Match duration: 4 x 8 minutes',
          'Timeouts: each team is allowed 2 timeouts per match, 1 minute each. Timeouts can only be called during a dead ball',
        ],
      },
    ],
    rules: [
      'Standard FIBA rules apply, including Traveling, Double-Dribble, Back-court Violation, Offensive 3 Seconds, 24-Second Shot Clock, Goaltending, and other applicable violations',
      {
        title: 'Clock Status',
        items: [
          'The match clock runs continuously, except during the final 2 minutes of the match, when a stop clock is used',
          'The clock may also be stopped by the referee or committee for a significant interruption: a dispute lasting more than 15 seconds, a physical confrontation, any situation needing the referee or committee, or anything else that significantly disrupts play',
          'The clock stays stopped until the situation is resolved and the referee lets play resume',
        ],
      },
      'Rest Period: 1-minute rest between quarters',
      'Time-out Restriction: time-outs can only be called during a dead ball. Calling a time-out during possession or live play is prohibited',
      'Ball: Size G7 basketballs will be used. Teams must bring their own practice/warmup balls',
      'Game Start: Each match begins with a Jump Ball',
      'Possession: Possession following a held ball will be determined by the Possession Arrow',
      {
        title: 'Personal & Team Fouls',
        items: [
          { title: 'Team Fouls', items: ['Team fouls are counted cumulatively within each quarter and reset to 0 at the start of each new quarter. Team fouls are not reset during the overtime period'] },
          { title: 'Bonus Situation', items: ['After a team commits 4 fouls in one quarter, the 5th foul and all subsequent team fouls in that quarter will result in two free throws being awarded to the opposing team'] },
          { title: 'Foul Limits', items: ['A player who receives their 4th personal foul will receive a warning. A player who receives their 5th personal foul is declared fouled-out and must leave the match'] },
        ],
      },
      {
        title: 'Technical and Unsportsmanlike Fouls',
        items: [
          {
            title: 'Technical Foul (T-Foul)',
            items: [
              'A Technical Foul is given for unethical actions, including disrespect, physical violence, disagreement with decisions, or other unsportsmanlike conduct',
              'One free throw will be awarded, and play will resume with the team that was in possession of the ball',
            ],
          },
          { title: 'T-Foul Ejection', items: ['Receiving 2 Technical Fouls in one match results in immediate ejection'] },
          {
            title: 'Unsportsmanlike Foul (U-Foul)',
            items: [
              'An Unsportsmanlike Foul is given for intentional or unintentional hard physical contact that could potentially cause injury',
              {
                title: 'Free throws will be awarded as follows',
                items: [
                  '2 free throws for a foul not committed in the act of shooting',
                  '2 or 3 free throws according to the shooting attempt',
                  '1 additional free throw if the shooting attempt is successful',
                ],
              },
              'Play will resume with the offended team',
            ],
          },
          { title: 'U-Foul Ejection', items: ['Receiving 1 Unsportsmanlike Foul in one match results in immediate ejection'] },
          { title: 'Tournament Disqualification', items: ['Receiving 2 Unsportsmanlike Fouls during the tournament results in disqualification of the respective member from the tournament'] },
        ],
      },
    ],
  },
  {
    slug: 'chess',
    name: 'Chess',
    category: 'Team sport',
    file: 'SportChess.jpg',
    description: 'It’s like having an existential crisis in your head, wondering if every move leads to grace or despair. Two people stare at wooden shapes for ages before committing acts of strategic destruction. Each piece becomes your army, sacrificed for the greater good. No rush to victory; only the silent tension of anticipating what’s next.',
    requirements: [
      'A maximum of 12 teams, divided into 2 groups of 6 teams',
      'Each team will consist of 4–5 registered players, with 4 players competing in each team match',
      'The fifth player is optional and may be used as a substitute',
      'Teams consisting of players from the same country will be given priority during registration to encourage national representation and international exchange',
      'Mixed-nationality teams are also fully eligible to participate',
      'Each player may represent only one team',
      'Each player must provide their full name, Chess.com username and current Chess.com Rapid rating',
      'Players without a Chess.com Rapid rating, or with fewer than 10 completed Rapid games, get a rating of 0 for seeding only. This does not affect eligibility',
    ],
    matches: [
      {
        title: 'Seeding',
        items: [
          'The average Rapid rating of a team’s four highest-rated registered players sets its seeding rating',
          'The 12 teams are ranked and split into 6 pots of 2 (Pot 1: seeds 1–2 … Pot 6: seeds 11–12). One team from each pot is drawn into Group A, the other into Group B',
        ],
      },
      {
        title: 'Group Stage',
        items: [
          'Each team plays every other team in its group once (5 matches per team)',
          'Each team match consists of 4 individual games',
          'Time control: 10+0',
          'Scoring: board points (Win = 1, Draw = 0.5, Loss = 0) and match points (team win = 2, draw = 1, loss = 0)',
          'Group tiebreakers (equal match points): total board points, then team-match wins, then individual wins with Black, then a tie-break match if necessary',
          'All 12 teams continue to the knockout stage: 1st–4th of each group play the C1 Championship Bracket, 5th–6th the C2 Community Bracket',
        ],
      },
      {
        title: 'C1 Championship Bracket',
        items: [
          'Quarterfinals: A1 vs B4, A2 vs B3, B1 vs A4, B2 vs A3',
          'Semifinals: winner QF1 vs winner QF4, winner QF3 vs winner QF2',
          'The semifinal losers play the Third-Place Match; the winners play the C1 Championship Final',
        ],
      },
      {
        title: 'C2 Community Bracket',
        items: [
          'Semifinals: A5 vs B6, B5 vs A6. The winners play the C2 Final',
          'The C2 Final may be played at the same time as the C1 Third-Place Match',
        ],
      },
      {
        title: 'Knockout Tiebreaks (match ends 2–2)',
        items: [
          'First tiebreak: all four boards play again at 5+0 with colours reversed; the team scoring more board points advances',
          'Armageddon (if still 2–2): each team secretly nominates one player and bids a Black time of up to 10 minutes. The lower bid gets Black with that time; White gets the full 10 minutes and must win, as a draw counts as a win for Black. Equal bids: colours are drawn',
        ],
      },
      {
        title: 'Line-ups and Colours',
        items: [
          'Players are placed in a fixed roster order by their registered Chess.com Rapid rating, highest to lowest',
          'A team may pick any 4 of its registered players for each match, playing in their relative roster order (e.g. Players 1, 2, 4, 5 play boards 1–4). Players can rotate between matches but cannot be moved to an artificially lower board',
          'Line-ups must be confirmed before the team match begins',
          'Each team gets 2 White and 2 Black boards per match, alternating across the boards. Board 1’s colour is decided before the match',
        ],
      },
    ],
    rules: [
      'Games will generally follow the FIDE Laws of Chess, except where tournament-specific rules stated here apply',
      'The standard touch-move rule applies',
      'Players must use the same hand to move a piece and press the clock',
      'First completed illegal move by a player: opponent receives +1 minute',
      'Second completed illegal move by the same player: loss of the game',
      'Players must play independently. Chess engines, electronic assistance, outside advice and communication concerning an ongoing game are prohibited',
      'Mobile phones and other electronic devices must not be used during games',
      'Players, substitutes and spectators must not advise or interfere with ongoing games',
      'Any rules dispute or situation not specifically covered here will be decided by the Chief Arbiter and/or Organising Committee according to the FIDE Laws of Chess',
    ],
  },
  {
    slug: 'futsal',
    name: 'Futsal',
    category: 'Team sport',
    file: 'SportFutsal.jpg',
    format: 'Men’s',
    description: 'Futsal is what happens when football runs out of space – Turmoil compressed into a tiny court. Ankles breaking, and suddenly everyone thinks they can create something spectacular. No space. No pause. No escape. Just five players, one ball, polished floor, and twelve minutes of beautifully controlled disorder.',
    requirements: [
      'Total of 12 teams, divided into 4 groups of 3 teams',
      '5 starting players and up to 7 substitutes',
      'Each team must assign 1 referee representative for the group and knockout games. Failure to provide a referee will result in a €10 fine per game',
    ],
    matches: [
      {
        title: 'Group Stage',
        items: [
          'Each team plays every other team in its group once (2 games per team)',
          'The top 2 teams of each group advance to the quarterfinals',
          'Match duration: 1 x 12 minutes (straight time: no time stoppage, no halftime)',
          'No timeouts',
          'Points system: Win = 3 points, Draw = 1 point, Loss = 0 points',
          'Tiebreakers: head-to-head result, goal difference, goals scored, fair play (fewer yellow/red cards), then a penalty shootout if still equal',
        ],
      },
      {
        title: 'Quarterfinals',
        items: [
          'Match duration: 1 x 12 minutes (straight time)',
          'If the score is even, the game is decided by a penalty shootout: 3 takers each, then sudden death',
        ],
      },
      {
        title: 'Semifinals',
        items: [
          'Match duration: 2 x 12 minutes (24 minutes total, straight time), 2-minute halftime break',
          'Timeouts: 1 per team per match (1 minute, time stops), only when play stops',
          'If the score is even, the game is decided by a penalty shootout: 3 takers each, then sudden death',
        ],
      },
      {
        title: 'Final',
        items: [
          'Match duration: 2 x 12.5 minutes (25 minutes total, clean time: the clock stops for fouls, outs, etc.), 2-minute halftime break',
          'Timeouts: 1 per team per match (1 minute, time stops), only when play stops',
          'If the score is even, the game is decided by a penalty shootout: 3 takers each, then sudden death',
        ],
      },
    ],
    rules: [
      { title: 'Ball', items: ['Size 4 futsal balls will be used. Teams are recommended to bring their own practice/warmup balls'] },
      { title: 'Kick-off', items: ['Decided by coin toss. The winner will choose whether they start with the ball or select a side'] },
      {
        title: 'Kick-in',
        items: [
          'Awarded when the entire ball crosses the sideline',
          'Must be taken within 4 seconds from the correct spot on the line',
          'Opposing players must stay at least 2 meters away from the kicker',
        ],
      },
      {
        title: 'Fouls',
        items: [
          'Direct Free Kicks: awarded for kicking, pushing, holding, sliding dangerously, or an intentional handball',
          'Indirect Free Kicks: Back-pass: an indirect free kick is awarded when a goalkeeper holds the ball with their hands after receiving a pass from their teammate',
        ],
      },
      { title: 'Accumulated Fouls', items: ['If a team commits 5 fouls in one half, every subsequent foul results in a penalty for the opposing team (fouls reset at halftime)'] },
      {
        title: 'Cards and Disciplinary Actions',
        items: [
          'Yellow Card: Warning',
          'Indirect Red Card: Accumulation of 2 yellow cards in one game: will result in a player suspension for the current and next match',
          'Direct Red Card: Immediate ejection: will result in a player suspension for the current and next match',
        ],
      },
      { title: 'Red Card Procedure (“Man Down”)', items: ['If a player gets a red card, their team will play with one less player for 2 minutes. Exception: If the opposing team scores within those 2 minutes, their team may bring on a substitute immediately'] },
      {
        title: 'Substitutions',
        items: [
          'Players may only enter through the substitution zone when the exiting player has fully left the playing grounds',
          'Timer not stopped for substitutions. Exceptions: timeouts or serious injuries',
        ],
      },
    ],
  },
  {
    slug: 'volleyball',
    name: 'Volleyball',
    category: 'Team sport',
    file: 'SportVolleyball.jpg',
    description: 'A conversation in the air, fighting for it never to end. This game is a constant exchange of power, precision and decisiveness, rewarding those who listen without speaking, and rush forward without hesitation when opportunity appears, spiking the ball so hard it splits the SEA.',
    requirements: [
      'Total of 8 teams, divided into 2 groups of 4 teams',
      'Each team consists of 6 main players and up to 6 substitute players, for a maximum of 12 registered players per team',
      'Each team must provide 1 main referee, 1 second referee, and 2 line judges. If a team fails to do so, they will be fined €5 per missing position',
    ],
    matches: [
      {
        title: 'Group Stage',
        items: [
          'Each team plays every other team in its group once (3 games per team)',
          'Match duration: 2 sets (15 points per set), 15 minutes each',
          'Points system: Win = 3 points, Draw = 1 point, Loss = 0 points',
          'Tiebreakers: head-to-head, then point difference',
          'The top 2 teams from each group advance to the semifinals',
        ],
      },
      { title: 'Semifinals', items: ['Best of three: 20 points per set, 15 minutes each for the first 2 sets. The final set is 20 minutes'] },
      { title: 'Final', items: ['Best of five: 20 points per set, 15 points for the 5th set. Deuce applies. 20 minutes per set; the final set is 15 minutes'] },
      'Timeouts: each team is allowed 1 timeout per set, 30 seconds each',
      'If a match exceeds the time limit, the team with the most total points wins',
    ],
    rules: [
      'Matches follow the FIVB Official Volleyball Rules 2025-2028',
      {
        title: 'Substitutions',
        items: [
          'Each team is allowed up to 6 substitutions per set',
          'Substitutions can only be made when the ball is out of play and with the referee’s permission',
        ],
      },
      {
        title: 'Rotation',
        items: [
          'Receiving team must be in the correct rotation position when the serve is made. This rule does not apply to the serving team',
          'When the receiving team wins a rally and gains the serve, players rotate clockwise',
        ],
      },
      { title: 'Disputes', items: ['Any disputes should be brought forth to the referee'] },
      {
        title: 'Other',
        items: [
          'Net height will be set at 240cm',
          'Libero is a specialized defensive player restricted to the back row. They wear a jersey contrasting in color to their teammates',
          'Back-row players may attack only if jumping from behind the 3-meter line',
        ],
      },
    ],
  },
];

export default sports;
