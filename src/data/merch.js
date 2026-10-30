import links from './links';

// All merch info lives here. The home page cards and the merch page
// (/merchandise/<slug>) are built from this list.
// Images go in public/images/. The first image is also used on the home page card.
// Size chart (Asian adult standard sizes, all in cm; same chart for every item).
// length = clothes length, chest = chest circumference, shoulder = shoulder width.
// The supplier chart gives weight in jin (斤); converted here to kg (1 jin = 0.5 kg).
const sizeRows = [
  //  size    length chest shoulder  height       weight (kg)
  ['XS',  62, 44, 42, '150–155', '42.5–47.5'],
  ['S',   64, 46, 44, '155–160', '47.5–52.5'],
  ['M',   66, 48, 46, '160–165', '52.5–57.5'],
  ['L',   68, 50, 48, '165–170', '57.5–62.5'],
  ['XL',  70, 52, 50, '170–175', '62.5–67.5'],
  ['2XL', 72, 54, 52, '175–180', '67.5–72.5'],
  ['3XL', 74, 56, 54, '180–185', '72.5–77.5'],
  ['4XL', 76, 58, 56, '185–190', '77.5–82.5'],
  ['5XL', 78, 60, 58, '190–200', '82.5–87.5'],
  ['6XL', 80, 62, 60, '200–210', '87.5–92.5'],
  ['7XL', 82, 64, 62, '210–220', '92.5–97.5'],
].map(([size, length, chest, shoulder, height, weight]) => ({ size, length, chest, shoulder, height, weight }));

// Shown under the size chart
export const sizeNotes = [
  'The actual product may vary by ±1–3 cm.',
  'Important: all garments use Chinese standard sizing, which runs smaller than European sizing. We strongly recommend ordering 1–2 sizes up from your usual EU size.',
];

const merch = [
  {
    slug: 'jersey',
    name: 'Official Jersey',
    price: '11€',
    // Design renders for now (cut from Final Jersey.png). Photoshoot pictures later:
    // images: ['Merch-Jersey-1.jpg', 'Merch-Jersey-2.jpg', 'Merch-Jersey-3.jpg', 'Merch-Jersey-4.jpg'],
    images: ['Merch-Jersey-Back.jpg', 'Merch-Jersey-Front.jpg'],   // close-ups also available: Merch-Jersey-Detail.jpg, Merch-Jersey-Crest.jpg
    storyTitle: 'Unity in Motion',
    // one string per paragraph: the story and meaning of the design
    story: [
      'Soft curves and a deep blue gradient flow across the jersey, capturing the spirit of unity and of playing together as one.',
      'The contour lines around each island grow closer and closer, just like the Aachen Hackenberg Open bridges borders and brings people together.',
      'On the back, dynamic waves connect the three nations: a visual nod to Southeast Asia, united on one stage.',
    ],
    formUrl: links.merchPresale,   // one presale form for all items
    sizes: sizeRows,
  },
  {
    slug: 't-shirt',
    name: 'T-Shirt',
    price: '12€',
    // Design renders for now (cut from Final T-Shirt.png). Photoshoot pictures later:
    // images: ['Merch-Tshirt-1.jpg', 'Merch-Tshirt-2.jpg', 'Merch-Tshirt-3.jpg', 'Merch-Tshirt-4.jpg'],
    images: ['Merch-Tshirt-Back.jpg', 'Merch-Tshirt-Front.jpg'],   // close-ups also available: Merch-Tshirt-Detail.jpg, Merch-Tshirt-Logo.jpg
    storyTitle: 'Energy & Heritage',
    story: [
      'On the front, handwritten lettering wrapped in fiery florals captures the passion and energy of sport, a homage to the cultures we come from.',
      'On the back, our three national animals, Long, Kura and Rimau, stand hand in hand to bring the SEA Games spirit to life.',
      'Splashing waves around them form the initials of the clubs and sports behind the Games, while fiery floral motifs reflect the unstoppable drive of every athlete.',
    ],
    // earlier text:
    // story: ["A dragon that rules the skies. A tiger that commands the land. A Komodo dragon that survives against all odds.",
    // "In the wild, their paths would never cross. But here in Aachen, they come together, not as rivals, but as equals.",
    // "The black canvas represents a world without borders, while their vibrant colours celebrate the identities we proudly carry."],
    formUrl: links.merchPresale,   // one presale form for all items
    sizes: sizeRows,
  },
];

// Combo deal: jersey + T-shirt together (shown on the merch section and both merch pages)
export const combo = { name: 'Jersey + T-Shirt combo', price: '20€', saving: '3€' };

export default merch;
