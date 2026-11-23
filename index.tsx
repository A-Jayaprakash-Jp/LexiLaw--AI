import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LocaleProvider } from './context/LocaleContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <LocaleProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LocaleProvider>
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);