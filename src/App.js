import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ScrollToHash from './components/ScrollToHash/ScrollToHash';
import DitherWave from './components/DitherWave/DitherWave';
import HomePage from './pages/HomePage';
// Sub-pages are only downloaded when someone opens them
import SportPage from './pages/SportPage/SportPage';
import MerchPage from './pages/MerchPage/MerchPage';

// Background: blue gradient on .app (App.css) with the dither wave canvas on top.
export default function App() {
  return (
    <div className="app">
      <ScrollToHash />
      <DitherWave />
      <Navbar />
      <main>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sports/:slug" element={<SportPage />} />
            <Route path="/merchandise/:slug?" element={<MerchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </main>
      <Footer />
    </div>
  );
}
