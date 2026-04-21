import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
                borderRadius: '14px',
                fontSize: '0.875rem',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#4ade80', secondary: 'rgba(15,23,42,0.8)' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: 'rgba(15,23,42,0.8)' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
