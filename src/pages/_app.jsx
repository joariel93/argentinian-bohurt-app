import React, { useState, useEffect } from 'react';
import 'primereact/resources/themes/arya-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@/styles/flags.css';

import '../styles/globals.css';
import Sidebar from '@/components/common/Sidebar.jsx';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const handleMobileToggle = (state) => {
    setMobileOpen(state !== undefined ? state : (prev) => !prev);
  };

  const handleOverlayClick = () => {
    setMobileOpen(false);
  };

  return (
    <ToastProvider>
      <AuthProvider>
        <div className="app-container">
        {isMobile && (
          <button className="sidebar-hamburger" onClick={() => handleMobileToggle()}>
            <i className={mobileOpen ? 'pi pi-times' : 'pi pi-bars'}></i>
          </button>
        )}

        {isMobile && mobileOpen && (
          <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
        )}

        <div className="flex">
          <div className="sidebar-wrapper">
            <Sidebar 
              mobileOpen={mobileOpen} 
              onMobileToggle={handleMobileToggle} 
              onOverlayClick={handleOverlayClick}
            />
          </div>
          <div className="main-content flex-1">
            <Component {...pageProps} />
          </div>
        </div>
      </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default MyApp;
