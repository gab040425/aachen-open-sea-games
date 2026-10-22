// All merch info lives here. The home page cards and the merch page
// (/merchandise/<slug>) are built from this list.
// Images go in public/images/. The first image is also used on the home page card.
const placeholder = '[Write this here]';

// Size chart: one row per size, fill in height (cm) and weight (kg) ranges.
const sizeRows = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => ({ size, height: '–', weight: '–' }));

const merch = [
  {
    slug: 'jersey',
    name: 'Official Jersey',
    price: '[Price]',
    images: ['Merch-Jersey-1.jpg', 'Merch-Jersey-2.jpg', 'Merch-Jersey-3.jpg', 'Merch-Jersey-4.jpg'],
    story: [placeholder],   // one string per paragraph: the story and meaning of the design
    formUrl: '#',           // TODO: Google Forms link
    sizes: sizeRows,
  },
  {
    slug: 't-shirt',
    name: 'T-Shirt',
    price: '[Price]',
    images: ['Merch-Tshirt-1.jpg', 'Merch-Tshirt-2.jpg', 'Merch-Tshirt-3.jpg', 'Merch-Tshirt-4.jpg'],
    story: [placeholder],
    formUrl: '#',           // TODO: Google Forms link
    sizes: sizeRows,
  },
];

export default merch;
