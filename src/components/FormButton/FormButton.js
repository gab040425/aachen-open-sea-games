import Icon from '../Icon/Icon';
import { useNow } from '../Countdown/Countdown';
import { isOpen } from '../../data/countdowns';

// Button to a sign-up / order form. Greyed out and unclickable outside the form's open window
// (`window` = an id from data/countdowns.js), then it switches on by itself.
export default function FormButton({ href, window, className = '', onClick, children }) {
  const now = useNow();
  const open = Boolean(href) && href !== '#' && isOpen(window, now);

  if (!open) {
    return (
      <a href="#" className={`btn btn-primary is-disabled ${className}`} aria-disabled="true" tabIndex={-1} onClick={(e) => e.preventDefault()}>
        {children} <Icon name="arrow" />
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`btn btn-primary ${className}`} onClick={onClick}>
      {children} <Icon name="arrow" />
    </a>
  );
}
