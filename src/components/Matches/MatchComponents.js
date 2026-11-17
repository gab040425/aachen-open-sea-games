import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon/Icon';
import { matchTime } from '../../data/matches';

export function TeamLogo({ team }) {
  // Remember the failed URL so a replacement URL can still load.
  // Missing/broken assets use a neutral shield.
  const [failedLogo, setFailedLogo] = useState(null);

  if (team.logo && failedLogo !== team.logo) {
    return (
      <img
        className="matches-team-logo"
        src={team.logo}
        alt={`${team.name} logo`}
        width="48"
        height="48"
        onError={() => setFailedLogo(team.logo)}
      />
    );
  }

  return (
    <svg
      className="matches-team-logo matches-team-logo--fallback"
      viewBox="0 0 32 32"
      role="img"
      aria-label={`${team.name} — team logo unavailable`}
    >
      <path d="M16 3 27 7v9c0 6-7 11-11 13C12 27 5 22 5 16V7Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m11 16 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function MatchStatusBadge({ status }) {
  // Status is provider-authoritative; this component only renders its label/style.
  return (
    <span className={`matches-status matches-status--${status.toLowerCase()}`}>
      {status === 'LIVE' && <span aria-hidden="true">● </span>}{status}
    </span>
  );
}

export function MatchScore({ match }) {
  // Nullish fallback preserves zero while distinguishing unknown scores.
  return (
    <span
      className="matches-score"
      aria-label={`Score: ${match.scoreA ?? 'not available'} to ${match.scoreB ?? 'not available'}`}
    >
      {match.scoreA ?? '–'} <span aria-hidden="true">–</span> {match.scoreB ?? '–'}
    </span>
  );
}

export function MatchTeam({ team }) {
  // Cards and scoreboards share markup; scoped parent CSS adapts the layout.
  return (
    <span className="matches-team">
      <TeamLogo team={team} />
      <span>{team.name}</span>
    </span>
  );
}

export function MatchCard({ match, selection }) {
  // The list item's data ID identifies the scroll target; state carries return filters.
  // Encode the ID so it stays within its intended route segment.
  return (
    <li data-match-id={match.matchId} className="matches-list__item">
      <Link
        className={`matches-match-card matches-match-card--${match.status.toLowerCase()}`}
        to={`/matches/${encodeURIComponent(match.matchId)}`}
        state={{ selection }}
      >
        <span className="matches-match-card__id">
          <strong>{match.matchId}</strong>
          <span>{match.stage}</span>
        </span>
        <MatchTeam team={match.teamA} />
        <MatchScore match={match} />
        <MatchTeam team={match.teamB} />
        <span className="matches-match-card__meta">
          <span><Icon name="pin" />{match.court}</span>
          <span><Icon name="calendar" /><time dateTime={match.scheduledAt}>{matchTime(match.scheduledAt)}</time></span>
        </span>
        <MatchStatusBadge status={match.status} />
        <Icon name="chevron-right" />
      </Link>
    </li>
  );
}

export function MatchesState({ title, children, error = false }) {
  // Announce failures as alerts and ordinary loading/empty updates as status messages.
  return (
    <div className="matches-state" role={error ? 'alert' : 'status'}>
      <Icon name="calendar" className="icon-accent" />
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function TeamLineup({ team }) {
  // Preserve roster order; captaincy comes from data, not player position.
  return (
    <article className="battle-page__lineup">
      <header>
        <TeamLogo team={team} />
        <h3>{team.name}</h3>
      </header>
      {team.players?.length ? (
        <ul>
          {team.players.map((player) => (
            <li key={player.id}>
              <Icon name="users" />
              <span>{player.name}</span>
              {player.isCaptain && <span className="battle-page__captain" aria-label="Captain">C</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="battle-page__unavailable">Lineup not available yet.</p>
      )}
    </article>
  );
}
