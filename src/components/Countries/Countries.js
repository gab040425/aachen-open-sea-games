import ImageSlot from '../ImageSlot/ImageSlot';
import './Countries.css';

const countries = [
  { name: 'Indonesia', file: 'indonesia.png', alt: 'Komodo dragon artwork for Indonesia' },
  { name: 'Malaysia', file: 'malaysia.png', alt: 'Tiger artwork for Malaysia' },
  { name: 'Vietnam', file: 'vietnam.png', alt: 'Dragon artwork for Vietnam' },
];

export default function Countries() {
  return (
    <section className="countries container">
      {countries.map((c) => (
        <ImageSlot key={c.name} file={c.file} alt={c.alt} className="country-card">
          <span className="country-name">{c.name}</span>
        </ImageSlot>
      ))}
    </section>
  );
}
