import SectionLabel from '../SectionLabel/SectionLabel';
import { Link } from 'react-router-dom';
import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import sports from '../../data/sports';
import links from '../../data/links';
import './Sports.css';

export default function Sports() {
  return (
    <section className="container section" id="sports">
      <SectionLabel>Sports</SectionLabel>
      <h2 className="title">Sports</h2>
      <a href={links.playerHandbook} target="_blank" rel="noreferrer" className="btn btn-dark sports-handbook">
        Player Handbook <Icon name="arrow" />
      </a>
      <p className="muted">Find your sport. Take your place in the game.</p>

      <div className="sports-grid">
        {sports.map((s) => (
          <Link key={s.slug} className="sport-card" to={`/sports/${s.slug}`}>
            <ImageSlot file={s.file} alt={s.name} className="sport-photo" sizes="(max-width: 860px) 100vw, 350px" />
            <div className="sport-body">
              <span className="sport-category">{s.category}</span>
              <span className="sport-name">{s.name} <Icon name="arrow" /></span>
              {s.format && <span className="sport-format">{s.format}</span>}
            </div>
          </Link>
        ))}
      </div>

      <p className="note">All skill levels are welcome. Check the rules and team requirements before registering.</p>
    </section>
  );
}
