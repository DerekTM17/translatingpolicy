import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'site-style'; // src/index.css (hub look) or src/styles/dashboard.css (dashboard look), set in vite.config.js
import App from './App.jsx';

// Hub effect: a page glow that follows the cursor. Skipped on touch screens and for reduced motion.
if (import.meta.env.VITE_STYLE !== 'dashboard' && !matchMedia('(hover: none)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.addEventListener('pointermove', (e) => {
    document.body.style.setProperty('--mx', `${e.clientX}px`);
    document.body.style.setProperty('--my', `${e.clientY}px`);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
