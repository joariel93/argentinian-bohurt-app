import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import 'primereact/resources/themes/arya-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@/styles/flags.css';
import '@/components/ArgentinaMap/ArgentinaMap.css';

import '../styles/globals.css';
import Sidebar from '@/components/common/Sidebar.jsx';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isNoIndexRoute =
    router.pathname.startsWith('/admin') || router.pathname === '/login';

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
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#10b981" />
          <link rel="icon" type="image/png" href="/shield.png" />
          <link rel="apple-touch-icon" href="/shield.png" />
          {isNoIndexRoute && (
            <meta name="robots" content="noindex, nofollow" />
          )}
        </Head>
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
