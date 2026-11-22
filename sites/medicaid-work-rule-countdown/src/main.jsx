import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'site-style'; // src/index.css (hub look) or src/styles/dashboard.css (dashboard look), set in vite.config.js
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
