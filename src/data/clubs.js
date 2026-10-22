// The three organising clubs, one per nation. Used by the "Organised by" section.
// logo: file in public/images/   color: a CSS variable from App.css
// main: true puts that club first on phones.
const placeholder = '[Write this here]';

const clubs = [
  {
    country: 'Vietnam',
    name: 'Hội Sinh viên Việt Nam tại Aachen/Jülich e.V.',
    short: 'SVA',
    role: 'Organiser',
    description: placeholder,
    stats: [{ label: 'Founded', value: '[Year]' }],
    logo: 'Club-Vietnam.png',
    link: '#',                       // TODO: website / Instagram
    color: 'var(--club-vietnam)',
    main: false,
  },
  {
    country: 'Indonesia',
    name: 'Perhimpunan Pelajar Indonesia di Aachen e.V.',
    short: 'PPI',
    role: 'Organiser',
    description: placeholder,
    stats: [{ label: 'Founded', value: '[Year]' }],
    logo: 'Club-Indonesia.png',
    link: '#',
    color: 'var(--club-indonesia)',
    main: false,
  },
  {
    country: 'Malaysia',
    name: 'Malaysisch-Aachener Klub e.V.',
    short: 'MAK',
    role: 'Organiser',
    description: placeholder,
    stats: [{ label: 'Founded', value: '[Year]' }],
    logo: 'Club-Malaysia.png',
    link: '#',
    color: 'var(--club-malaysia)',
    main: false,
  },
];

export default clubs;
