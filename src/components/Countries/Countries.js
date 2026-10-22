import SectionLabel from '../SectionLabel/SectionLabel';
import ImageSlot from '../ImageSlot/ImageSlot';
import './Countries.css';

const countries = [
  { name: 'Vietnam', file: 'Dragon.jpg', alt: 'Dragon artwork for Vietnam' },
  { name: 'Indonesia', file: 'Komodo.jpg', alt: 'Komodo dragon artwork for Indonesia' },
  { name: 'Malaysia', file: 'Tiger.jpg', alt: 'Tiger artwork for Malaysia' },
];

export default function Countries() {
  return (
    <section className="countries container">
      <SectionLabel>The nations</SectionLabel>
      {countries.map((c) => (
        <ImageSlot key={c.name} file={c.file} alt={c.alt} className="country-card" sizes="(max-width: 860px) 420px, 350px">
          <span className="country-name">{c.name}</span>
        </ImageSlot>
      ))}
    </section>
  );
}
