import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AudioProvider>
          <App />
        </AudioProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
);
