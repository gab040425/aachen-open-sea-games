import { useEffect, useRef, useState } from 'react';
import ImageSlot from '../ImageSlot/ImageSlot';
import SectionLabel from '../SectionLabel/SectionLabel';
import clubs from '../../data/clubs';
import './Organizers.css';

export default function Organizers() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  // Fade the cards in once the section scrolls into view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: '-80px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={`container section organizers ${visible ? 'is-visible' : ''}`} id="organizers">
      <SectionLabel>Organisers</SectionLabel>

      <div className="organizers-head">
        <h2 className="title">Organised by</h2>
        <p className="muted">Three student clubs, one for each nation, bring the Aachen Open: SEA Games to life.</p>
      </div>

      <div className="org-grid">
        {clubs.map((club, i) => {
          const external = club.link && club.link !== '#';
          return (
            <a
              key={club.country}
              href={club.link}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className={`org-card ${club.main ? 'is-main' : ''}`}
              style={{ '--club': club.color, '--i': i, '--logo-h': `${club.logoHeight}px` }}
              aria-label={`${club.name}, ${club.country}`}
            >
              <ImageSlot file={club.logo} alt={`${club.name} logo`} className="org-logo" sizes="112px" />
              <div>
                <div className="org-short">{club.short}</div>
                <div className="org-name">{club.name}</div>
                <div className="org-role">{club.role} · {club.country}</div>
              </div>
              <p className="org-description">{club.description}</p>
              <div className="org-stats">
                {club.stats.map((s) => (
                  <div key={s.label}>
                    <span className="org-stat-value">{s.value}</span>
                    <span className="org-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
