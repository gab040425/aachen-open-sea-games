// All sport info lives here. The home page cards and each sport page
// (/sports/<slug>) are built from this list.
// To add a sport: copy one entry, give it a unique slug, put its photo in public/images/.
const placeholder = '[Write this here]';

const sports = [
  {
    slug: 'badminton',
    name: 'Badminton',
    category: 'Racket sport',
    file: 'SportBadminton.jpg',
    format: 'Men’s Doubles  ·  Mixed Doubles',
    description: placeholder,
    details: [
      { label: 'Date & time', value: placeholder },
      { label: 'Court', value: placeholder },
      { label: 'Team size', value: placeholder },
    ],
    rules: [placeholder],
    requirements: [placeholder],
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    category: 'Team sport',
    file: 'SportBasketball.jpg',
    description: placeholder,
    details: [
      { label: 'Date & time', value: placeholder },
      { label: 'Court', value: placeholder },
      { label: 'Team size', value: placeholder },
    ],
    rules: [placeholder],
    requirements: [placeholder],
  },
  {
    slug: 'chess',
    name: 'Chess',
    category: 'Team sport',
    file: 'SportChess.jpg',
    description: placeholder,
    details: [
      { label: 'Date & time', value: placeholder },
      { label: 'Room', value: placeholder },
      { label: 'Team size', value: placeholder },
    ],
    rules: [placeholder],
    requirements: [placeholder],
  },
  {
    slug: 'futsal',
    name: 'Futsal',
    category: 'Team sport',
    file: 'SportFutsal.jpg',
    format: 'Men’s',
    description: placeholder,
    details: [
      { label: 'Date & time', value: placeholder },
      { label: 'Pitch', value: placeholder },
      { label: 'Team size', value: placeholder },
    ],
    rules: [placeholder],
    requirements: [placeholder],
  },
  {
    slug: 'volleyball',
    name: 'Volleyball',
    category: 'Team sport',
    file: 'SportVolleyball.jpg',
    description: placeholder,
    details: [
      { label: 'Date & time', value: placeholder },
      { label: 'Court', value: placeholder },
      { label: 'Team size', value: placeholder },
    ],
    rules: [placeholder],
    requirements: [placeholder],
  },
];

export default sports;
