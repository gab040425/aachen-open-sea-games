import Hero from '../components/Hero/Hero';
import Countries from '../components/Countries/Countries';
import EventInfo from '../components/EventInfo/EventInfo';
import About from '../components/About/About';
import Organizers from '../components/Organizers/Organizers';
import Sports from '../components/Sports/Sports';
import Merch from '../components/Merch/Merch';
import Vendors from '../components/Vendors/Vendors';
import Faq from '../components/Faq/Faq';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Countries />
      <EventInfo />
      <About />
      <Sports />
      <Merch />
      <Vendors />
      <Faq />
      <Organizers />
    </>
  );
}
