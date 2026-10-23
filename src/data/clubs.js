// The three organising clubs, one per nation. Used by the "Organised by" section.
// logo: file in public/images/   color: a CSS variable from App.css
// main: true puts that club first on phones.

const clubs = [
  {
    country: 'Vietnam',
    name: 'Hội Sinh viên Việt Nam tại Aachen/Jülich e.V.',
    short: 'SVA',
    role: 'Organiser',
    description: 'Led by an executive committee of 22 members, SVA is the official organisation representing the Vietnamese student community in Aachen and Jülich. At its core, SVA aims to build a warm, connected Vietnamese family – a safe space where students support one another through everyday student life, feel at home, and where a long day of studying can end in a spontaneous get-together with people who feel like family.',
    stats: [{ label: 'Founded', value: '2013' }],
    logo: 'Logo_SVA.png',
    link: 'https://www.instagram.com/siviaachen/',
    color: 'var(--club-vietnam)',
    main: false,
  },
  {
    country: 'Indonesia',
    name: 'Perhimpunan Pelajar Indonesia di Aachen e.V.',
    short: 'PPI',
    role: 'Organiser',
    description: 'PPI Aachen plays an important role within the Indonesian community in Aachen and is one of the largest and oldest Indonesian student organizations in Europe. With a community consisting of hundreds of Indonesians, PPI Aachen actively organizes and participates in various activities across different fields. One of PPI Aachen’s main missions is to promote Indonesian culture and strengthen the bonds among Indonesians living in Aachen.',
    stats: [{ label: 'Founded', value: '1956' }],
    logo: 'Logo_PPI.png',
    link: 'https://www.instagram.com/ppiaachen/',
    color: 'var(--club-indonesia)',
    main: false,
  },
  {
    country: 'Malaysia',
    name: 'Malaysisch-Aachener Klub e.V.',
    short: 'MAK',
    role: 'Organiser',
    description: 'An accredited student organization recognized by RWTH Aachen University. Since its establishment, MAK serves as a platform that not only celebrates Malaysian culture but also strengthens connections within the Malaysian community and promotes meaningful cultural exchange with the wider international community in Aachen.',
    stats: [{ label: 'Founded', value: '2019' }],
    logo: 'Logo_MAK.png',
    link: 'https://www.instagram.com/malaysia.aachen/',
    color: 'var(--club-malaysia)',
    main: false,
  },
];

export default clubs;
