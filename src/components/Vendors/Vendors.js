import SectionLabel from '../SectionLabel/SectionLabel';
import Countdown from '../Countdown/Countdown';
import FormButton from '../FormButton/FormButton';
import { getCountdown } from '../../data/countdowns';
import links from '../../data/links';
import './Vendors.css';

// Booths / vendors. The form button switches on by itself while vendor registration is open
// (dates in data/countdowns.js, form link in data/links.js).
export default function Vendors() {
  return (
    <section className="container section" id="vendors">
      <SectionLabel>Vendors</SectionLabel>
      <div className="vendors-layout">
        <div className="vendors-text">
          <h2 className="title">Not into sports?</h2>
          <p className="muted">We have something for you too. Run a booth at the Games: sell food, drinks, crafts or merch, or show off your club or brand to hundreds of players and supporters.</p>
        </div>
        {/* countdown + sign-up on the right */}
        <div className="vendors-signup">
          <Countdown countdown={getCountdown('vendor-registration')} className="vendors-countdown" />
          <FormButton href={links.vendorRegistration} window="vendor-registration" className="vendors-button">Register your booth</FormButton>
        </div>
      </div>
    </section>
  );
}
