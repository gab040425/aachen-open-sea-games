import { Link, Navigate, useParams } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot/ImageSlot';
import Icon from '../../components/Icon/Icon';
import Countdown from '../../components/Countdown/Countdown';
import sports from '../../data/sports';
import { getCountdown } from '../../data/countdowns';
import './SportPage.css';

// A rule is a string (one bullet) or { title, items } (a sub-heading with nested rules).
function RuleList({ items }) {
  return (
    <ul>
      {items.map((r, i) => (typeof r === 'string' ? <li key={i}>{r}</li> : (
        <li key={i} className="rule-group">
          <h3>{r.title}</h3>
          <RuleList items={r.items} />
        </li>
      )))}
    </ul>
  );
}

export default function SportPage() {
  const { slug } = useParams();
  const sport = sports.find((s) => s.slug === slug);
  if (!sport) return <Navigate to="/#sports" replace />;

  const others = sports.filter((s) => s.slug !== slug);

  return (
    <div className="sport-page container">
      <Link to="/#sports" className="back-link">← All sports</Link>

      {/* Header: text + photo */}
      <section className="split sport-header">
        <div className="split-text">
          <span className="sport-category">{sport.category}</span>
          <h1 className="title-lg">{sport.name}</h1>
          {sport.format && <p className="sport-page-format">{sport.format}</p>}
          <p className="muted">{sport.description}</p>
          {/* Register button hidden until registration opens; the countdown stands in for it.
          <div className="hero-actions">
            <a href="#" className="btn btn-primary">Register for {sport.name} <Icon name="arrow" /></a>
          </div>
          */}
          <Countdown countdown={getCountdown('registration')} className="sport-countdown" />
        </div>
        <ImageSlot file={sport.file} alt={sport.name} className="photo sport-page-photo" sizes="(max-width: 860px) 100vw, 465px" eager />
      </section>

      {/* Team requirements, then rules */}
      <section className="sport-info section">
        <div className="sport-info-card">
          <h2>{sport.requirementsTitle || 'Team requirements'}</h2>
          <ul>{sport.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
        <div className="sport-info-card sport-rules">
          <h2>Rules</h2>
          <RuleList items={sport.rules} />
        </div>
      </section>

      {/* Other sports */}
      <section className="section">
        <h2 className="title">Other sports</h2>
        <div className="other-sports">
          {others.map((s) => (
            <Link key={s.slug} to={`/sports/${s.slug}`} className="btn btn-dark">
              {s.name} <Icon name="arrow" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
