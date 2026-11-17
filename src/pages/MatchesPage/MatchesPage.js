import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import useMatches from '../../components/Matches/useMatches';
import useScheduleLayout from '../../components/Matches/useScheduleLayout';
import { MatchCard, MatchesState } from '../../components/Matches/MatchComponents';
import { MATCH_SPORTS, SPORT_STORAGE_KEY, defaultMatchDay, filterMatches, scrollTarget, validSport } from '../../data/matches';
import './Matches.css';

const MATCH_VIEWS = [
  { id: 'list', label: 'Match List', icon: 'menu' },
  { id: 'bracket', label: 'Tournament Bracket', icon: 'trophy' },
];

function MatchList({ matches, selection, listRef }) {
  return (
    <ol className="matches-list" ref={listRef}>
      {matches.map((match) => <MatchCard key={match.matchId} match={match} selection={selection} />)}
    </ol>
  );
}

export default function MatchesPage() {
  const { state } = useLocation();
  const pageRef = useRef(null);
  const controlsRef = useRef(null);
  const startRef = useRef(null);
  const panelRef = useRef(null);
  const listRef = useRef(null);
  const scrollState = useRef({ key: null, done: false });
  const scrollToMatch = useScheduleLayout(pageRef, controlsRef, startRef, panelRef);
  // Return navigation can restore both filters; initial rendering stays SSR-safe.
  const [sport, setSport] = useState(validSport(state?.selection?.sport));
  const [day, setDay] = useState(state?.selection?.day === 2 ? 2 : 1);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('list');
  const { matches, loading, error, retry } = useMatches();
  useEffect(() => {
    // Initialize browser defaults after hydration. Battle Page return selection wins;
    // manual day changes are not continuously overridden by the current date.
    if (!state?.selection) {
      try { setSport(validSport(localStorage.getItem(SPORT_STORAGE_KEY))); } catch { /* Storage may be disabled. */ }
      setDay(defaultMatchDay());
    }
    setReady(true);
  }, [state]);
  const chooseSport = (id) => {
    setSport(id);
    // Persist only the stable sport ID; blocked storage must not prevent filtering.
    try { localStorage.setItem(SPORT_STORAGE_KEY, id); } catch { /* Selection still works without storage. */ }
  };
  // Filter locally without starting another provider request.
  const filtered = useMemo(() => filterMatches(matches, sport, day), [matches, sport, day]);
  useEffect(() => {
    const key = sport + '-' + day;
    if (scrollState.current.key !== key) scrollState.current = { key, done: false };
    if (!ready || loading || view !== 'list' || scrollState.current.done) return;
    const target = scrollTarget(filtered);
    if (!target) return;
    let cancelled = false;
    let frame = 0;
    // Wait for fonts and committed layout, after the shared route-to-top effect.
    // Page-owned completion survives bracket toggles and data refreshes; only an
    // explicit sport/day change starts another automatic navigation.
    Promise.resolve(document.fonts?.ready).then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (cancelled) return;
          const node = Array.from(listRef.current?.children || []).find((item) => item.dataset.matchId === target.matchId);
          if (node && scrollToMatch(node)) scrollState.current.done = true;
        });
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [filtered, sport, day, view, ready, loading, scrollToMatch]);
  function handleViewKeyDown(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    // Two-tab roving focus: selection and keyboard focus move together.
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
    setView(MATCH_VIEWS[next].id);
    event.currentTarget.parentElement.children[next].focus();
  }

  function renderSchedule() {
    if (view === 'bracket') {
      return (
        <MatchesState title="Tournament bracket coming soon.">
          <p>The tournament draw will appear here once published.</p>
        </MatchesState>
      );
    }

    if (loading || !ready) return <MatchesState title="Loading match schedule…" />;

    if (error) {
      return (
        <MatchesState title="Unable to load the schedule" error>
          <p>Please try again in a moment.</p>
          <button type="button" className="matches-retry" onClick={retry}>Try again</button>
        </MatchesState>
      );
    }

    if (!filtered.length) {
      return (
        <MatchesState title="Match schedule coming soon">
          <p>Fixtures and results will appear here once the tournament schedule is published.</p>
        </MatchesState>
      );
    }

    return <MatchList matches={filtered} selection={{ sport, day }} listRef={listRef} />;
  }

  return (
    <div className="matches-page container" ref={pageRef}>
      <header className="matches-page__header">
        <h1>Matches &amp; Results</h1>
        <p>Follow every match, every score, every victory.</p>
      </header>
      <div ref={startRef} aria-hidden="true" />
      <div className="matches-controls" ref={controlsRef} role="region" aria-label="Schedule controls">
        <div className="matches-page__sport-label" id="matches-sport-label">Select sport</div>
        <div className="matches-sport-selector" role="group" aria-labelledby="matches-sport-label">
          {MATCH_SPORTS.map(({ id, name }) => (
            <button type="button" key={id} aria-pressed={sport === id} onClick={() => chooseSport(id)}>
              {name}
            </button>
          ))}
        </div>
        <div className="matches-view-tabs" role="tablist" aria-label="Schedule view">
          {MATCH_VIEWS.map(({ id, label, icon }, index) => (
            <button
              type="button"
              role="tab"
              id={`matches-tab-${id}`}
              aria-selected={view === id}
              aria-controls="matches-panel"
              tabIndex={view === id ? 0 : -1}
              key={id}
              onClick={() => setView(id)}
              onKeyDown={(event) => handleViewKeyDown(event, index)}
            >
              <Icon name={icon} />{label}
            </button>
          ))}
        </div>
        <div className="matches-schedule-header">
          <h2><Icon name="calendar" />Match Schedule</h2>
          <div className="matches-day-selector" role="group" aria-label="Tournament day">
            {[1, 2].map((value) => (
              <button type="button" key={value} aria-pressed={day === value} onClick={() => setDay(value)}>
                Day {value}<span>December {value + 4}, 2026</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div id="matches-panel" ref={panelRef} role="tabpanel" aria-labelledby={`matches-tab-${view}`} tabIndex="0" className="matches-panel">
        {renderSchedule()}
      </div>
      <p className="matches-page__timezone">All match times are shown in Europe/Berlin.</p>
    </div>
  );
}
