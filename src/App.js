import './App.css';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Countries from './components/Countries/Countries';
import EventInfo from './components/EventInfo/EventInfo';
import About from './components/About/About';
import Sports from './components/Sports/Sports';
import Faq from './components/Faq/Faq';
import Footer from './components/Footer/Footer';

// The background image lives on .app (see App.css) so one long image
// stretches continuously behind every section.
export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <Countries />
        <EventInfo />
        <About />
        <Sports />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
