import { useEffect, useState } from 'react';
import { getMatches } from '../../data/matches';

// Each caller owns its result; this hook does not share or cache responses.
// Keep custom provider identities stable so ordinary renders do not reload data.
export default function useMatches(provider = getMatches) {
  const [state, setState] = useState({ matches: [], loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ matches: [], loading: true, error: null });
    // Invoke inside the chain so synchronous throws also reach the error handler.
    // The provider must return normalized Match[] (see docs/matches-data.md).
    Promise.resolve().then(() => provider({ signal: controller.signal })).then((matches) => {
      // Ignore stale completions even if a future provider ignores cancellation.
      if (!controller.signal.aborted) setState({ matches, loading: false, error: null });
    }).catch((error) => {
      if (!controller.signal.aborted) setState({ matches: [], loading: false, error });
    });
    // Cancel the old attempt on unmount, provider replacement, or manual retry.
    return () => controller.abort();
  }, [provider, attempt]);
  // A new attempt reuses the lifecycle and clears previous data while loading.
  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
