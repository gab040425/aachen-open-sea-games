import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import './Sports.css';

// To add a sport: add an entry here and put its photo in public/images/
const sports = [
  { name: 'Badminton', category: 'Racket sport', file: 'sport-badminton.png', format: 'Men’s Doubles\u00a0\u00a0·\u00a0\u00a0Mixed Doubles' },
  { name: 'Basketball', category: 'Team sport', file: 'sport-basketball.png' },
  { name: 'Chess', category: 'Team sport', file: 'sport-chess.png' },
  { name: 'Futsal', category: 'Team sport', file: 'sport-futsal.png', format: 'Men’s' },
  { name: 'Volleyball', category: 'Team sport', file: 'sport-volleyball.png' },
];

export default function Sports() {
  return (
    <section className="container section" id="sports">
      <h2 className="title">Sports</h2>
      <p className="muted">Find your sport. Take your place in the game.</p>

      <div className="sports-grid">
        {sports.map((s) => (
          <a key={s.name} className="sport-card" href="#">
            <ImageSlot file={s.file} alt={s.name} className="sport-photo" />
            <div className="sport-body">
              <span className="sport-category">{s.category}</span>
              <span className="sport-name">{s.name} <Icon name="arrow" /></span>
              {s.format && <span className="sport-format">{s.format}</span>}
            </div>
          </a>
        ))}
      </div>

      <p className="note">All skill levels are welcome. Check the rules and team requirements before registering.</p>
    </section>
  );
}
