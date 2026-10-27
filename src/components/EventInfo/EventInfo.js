import SectionLabel from '../SectionLabel/SectionLabel';
import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import './EventInfo.css';

const facts = [
  { icon: 'calendar', label: 'Date', value: '5-6 December 2026' },
  { icon: 'pin', label: 'Location', value: 'Berufskolleg Nord, Herzogenrath' },
  { icon: 'users', label: 'Participants', value: 'Vietnam · Malaysia · Indonesia' },
  { icon: 'trophy', label: 'Competition', value: '5 sports. One unforgettable weekend.' },
];

export default function EventInfo() {
  return (
    <section className="container section" id="event-info">
      <SectionLabel>Event</SectionLabel>
      <div className="split">
        <div className="split-text">
          <h2 className="title-lg">EVENT INFORMATION</h2>
          <p className="muted">Everything you need to know about the Aachen Hackenberg Open: SEA Games</p>
        </div>
        <ImageSlot file="EventInfo.jpg" alt="Players at a previous event" className="photo photo-info" sizes="(max-width: 860px) 100vw, 440px" />
      </div>

      <div className="info-row">
        <ImageSlot file="Berufskolleg_Herzogenrath_a.jpg" alt="Berufskolleg Nord in Herzogenrath" className="photo venue" sizes="(max-width: 860px) 100vw, 680px" />

        <ul className="facts">
          {facts.map((f) => (
            <li key={f.label}>
              <Icon name={f.icon} className="icon-accent" />
              <div>
                <span className="fact-label">{f.label}</span>
                <span className="fact-value">{f.value}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
