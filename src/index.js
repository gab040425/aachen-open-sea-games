import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './fonts';
import App from './App';

const root = document.getElementById('root');
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root,
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>
  );
}
