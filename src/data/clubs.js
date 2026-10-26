// The three organising clubs, one per nation. Used by the "Organised by" section.
// logo: file in public/images/   logoHeight: how tall the logo is drawn (px) – tuned so all three look the same size
// color: a CSS variable from App.css
// main: true puts that club first on phones.

const clubs = [
  {
    country: 'Vietnam',
    name: 'Hội Sinh viên Việt Nam tại Aachen/Jülich e.V.',
    short: 'SVA',
    role: 'Organiser',
    description: 'As the official body representing Vietnamese students and Azubis in Aachen & Jülich, SVA builds a warm, connected Vietnamese family – a safe space where students support each other, feel at home, and end long study days in spontaneous get-togethers with people who feel like family.',
    stats: [{ label: 'Founded', value: '2013' }],
    logo: 'Logo_SVA.png',
    logoHeight: 72,
    link: 'https://www.instagram.com/siviaachen/',
    color: 'var(--club-vietnam)',
    main: false,
  },
  {
    country: 'Indonesia',
    name: 'Perhimpunan Pelajar Indonesia di Aachen e.V.',
    short: 'PPI',
    role: 'Organiser',
    description: 'As one of the largest and oldest Indonesian student organizations in Europe, PPI Aachen actively organizes and participates in various activities across different fields as one of its main missions is to promote Indonesian culture and strengthen the bonds among Indonesians living in Aachen.',
    stats: [{ label: 'Founded', value: '1956' }],
    logo: 'Logo_PPI.png',
    logoHeight: 64,
    link: 'https://www.instagram.com/ppiaachen/',
    color: 'var(--club-indonesia)',
    main: false,
  },
  {
    country: 'Malaysia',
    name: 'Malaysisch-Aachener Klub e.V.',
    short: 'MAK',
    role: 'Organiser',
    description: 'MAK serves as a platform that not only celebrates Malaysian culture but also strengthens connections within the Malaysian community and promotes meaningful cultural exchange with the wider international community in Aachen.',
    stats: [{ label: 'Founded', value: '2019' }],
    logo: 'Logo_MAK.png',
    logoHeight: 88,
    link: 'https://www.instagram.com/malaysia.aachen/',
    color: 'var(--club-malaysia)',
    main: false,
  },
];

export default clubs;
