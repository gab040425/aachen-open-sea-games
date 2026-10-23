// All sport info lives here. The home page cards and each sport page
// (/sports/<slug>) are built from this list.
// To add a sport: copy one entry, give it a unique slug, put its photo in public/images/.
// Rules: a plain string is one bullet; { title, items } is a sub-heading with its own bullets (can be nested).

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
      'Only Men’s doubles and mixed doubles',
      'Each team must assign a referee representative for the group and knockout games. Failure to do so will result in a €10 fine',
      'Each player can only participate in one of the categories due to schedule conflicts',
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
      'Each team must consist of a minimum of 5 players and a maximum of 10 players (5 core players + 5 substitutes)',
      'Each team must provide a minimum of 2 referees for the group stage and knockout games. Failure to provide referees will result in a €10 fine per game',
    ],
    rules: [
      'Standard FIBA rules apply, including Traveling, Double-Dribble, Back-court Violation, Offensive 3 Seconds, 24-Second Shot Clock, Goaltending, and other applicable violations',
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
      'Each team will consist of 4–5 registered players, with 4 players competing in each team match',
      'The fifth player is optional and may be used as a substitute',
      'Teams consisting of players from the same country will be given priority during registration to encourage national representation and international exchange',
      'Mixed-nationality teams are also fully eligible to participate',
      'Each player may represent only one team',
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
    description: 'Futsal is what happens when football runs out of space – Turmoil compressed into a tiny court. Ankles breaking, and suddenly everyone thinks they can create something spectacular. No space. No pause. No escape. Just five players, one ball, polished floor, and forty minutes of beautifully controlled disorder.',
    requirements: [
      '5 starting players and up to 5 substitutes',
      'Each team must assign a referee representative for the group and knockout games. Failure to provide a referee will result in a €10 fine per game',
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
      'Each team consists of 6 main players and up to 6 substitute players, for a maximum of 12 registered players per team',
      'Each team must provide 1 main referee, 1 second referee, and 2 line judges. If a team fails to do so, they will be fined €5 per missing position',
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
