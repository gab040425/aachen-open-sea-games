import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// On every route change: scroll to the #section in the URL if there is one,
// otherwise jump to the top of the new page.
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView();
  }, [pathname, hash]);

  return null;
}
