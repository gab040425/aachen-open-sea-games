import { Link, useLocation, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import useMatches from '../../components/Matches/useMatches';
import { MatchesState, MatchScore, MatchStatusBadge, MatchTeam, TeamLineup } from '../../components/Matches/MatchComponents';
import { MATCH_SPORTS, findMatch, matchTime } from '../../data/matches';
import './Matches.css';

export function MatchScoreboard({ match }) {
  // Basic shared scoring for now; sport-specific breakdowns are future work.
  return (
    <section className={`battle-page__scoreboard matches-match-card--${match.status.toLowerCase()}`} aria-label="Match scoreboard">
      <div className="battle-page__scores">
        <MatchTeam team={match.teamA} />
        <div className="battle-page__score-center">
          <MatchStatusBadge status={match.status} />
          <MatchScore match={match} />
        </div>
        <MatchTeam team={match.teamB} />
      </div>
      <div className="battle-page__metadata">
        <span><Icon name="pin" />{match.court}</span>
        <span><Icon name="calendar" /><time dateTime={match.scheduledAt}>Day {match.day}, {matchTime(match.scheduledAt)}</time> (Berlin)</span>
        <span><Icon name="trophy" />{match.stage}</span>
      </div>
    </section>
  );
}

export default function BattlePage() {
  const { matchId } = useParams();
  const { state } = useLocation();
  const { matches, loading, error, retry } = useMatches();
  // Direct URLs use the same provider rather than relying on a prior card visit.
  const match = findMatch(matches, matchId);
  // Prefer original filters; direct entry falls back to the loaded match's filters.
  const selection = state?.selection || (match ? { sport: match.sport, day: match.day } : undefined);

  // Keep the back link outside these branches so it remains available in every state.
  function renderMatch() {
    if (loading) return <MatchesState title="Loading match…" />;

    if (error) {
      return (
        <MatchesState title="Unable to load this match" error>
          <button type="button" className="matches-retry" onClick={retry}>Try again</button>
        </MatchesState>
      );
    }

    if (!match) {
      return (
        <MatchesState title="Match not found">
          <p>This match is not available. Explore the schedule for published fixtures.</p>
          <Link className="matches-retry" to="/matches">Back to schedule</Link>
        </MatchesState>
      );
    }

    return (
      <>
        <header className="battle-page__header">
          <p><span>{MATCH_SPORTS.find(({ id }) => id === match.sport)?.name}</span> · Match {match.matchId}</p>
          <h1>{match.teamA.name} vs {match.teamB.name}</h1>
        </header>
        <MatchScoreboard match={match} />
        <section className="battle-page__lineups" aria-labelledby="matches-lineups-heading">
          <h2 id="matches-lineups-heading">Team Lineups</h2>
          <div className="battle-page__teams">
            <TeamLineup team={match.teamA} />
            <TeamLineup team={match.teamB} />
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="battle-page container">
      <Link to="/matches" state={selection ? { selection } : null} className="battle-page__back">
        <Icon name="chevron-left" />All Matches
      </Link>
      {renderMatch()}
    </div>
  );
}
