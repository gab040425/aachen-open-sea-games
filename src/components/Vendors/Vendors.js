import SectionLabel from '../SectionLabel/SectionLabel';
import Countdown from '../Countdown/Countdown';
import FormButton from '../FormButton/FormButton';
import { getCountdown } from '../../data/countdowns';
import links from '../../data/links';
import Carousel from '../Carousel/Carousel';
import './Vendors.css';

// Images file name
const images=[ 'Vendor.jpg', 'Vendor-2.jpg','Vendor-3.jpg','Vendor-4.jpg',];

// Booths / vendors. The form button switches on by itself while vendor registration is open
// (dates in data/countdowns.js, form link in data/links.js).
export default function Vendors() {
  return (
    <section className="container section" id="vendors">
      <SectionLabel>Vendors</SectionLabel>
      <div className="vendors-layout">
        <div className="vendors-text">
          <h2 className="title">Not into sports?</h2>
          <p className="muted">We have something for you too. Run a booth at the Games: sell food or drinks, show off your club or brand to hundreds of players and supporters.</p>
          <div className="vendors-gallery">
            <Carousel images={images} alt="Vendor booths at a past event" zoom={false} />
          </div>
          <p className="vendors-fee-note">
            <span>Booth rental</span>
            One day for <strong>90€</strong> or both days for <strong>160€</strong> !
          </p>
        </div>
        {/* countdown + sign-up on the right */}
        <div className="vendors-signup">
          <Countdown countdown={getCountdown('vendor-registration')} className="vendors-countdown" />
          <FormButton href={links.vendorRegistration} window="vendor-registration" className="vendors-button">Register your booth</FormButton>
          <div className="vendors-links">
            <a href={links.termsAndConditions || undefined}>Terms & Conditions</a>
            <a href={links.hygieneChecklist || undefined}> Hygiene Checklist</a>
          </div>
        </div>
      </div>
    </section>
  );
}
