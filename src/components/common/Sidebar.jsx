import React, { useState, useEffect } from 'react';
import { Menu } from 'primereact/menu';
import { useRouter } from 'next/router';

const Sidebar = ({ mobileOpen, onMobileToggle, onOverlayClick }) => {
    const [expanded, setExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkViewport = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
        };
        checkViewport();
        window.addEventListener('resize', checkViewport);
        return () => window.removeEventListener('resize', checkViewport);
    }, []);

    const menuItems = [
        {
            label: 'Inicio',
            icon: 'pi pi-home',
            command: () => { router.push('/'); onMobileToggle && onMobileToggle(false); }
        },
        {
            label: 'Clubes',
            icon: 'pi pi-users',
            command: () => { router.push('/clubs'); onMobileToggle && onMobileToggle(false); }
        },
        {
            label: 'Noticias',
            icon: 'pi pi-comments',
            command: () => { router.push('/news'); onMobileToggle && onMobileToggle(false); }
        },
        {
            label: 'Torneos',
            icon: 'pi pi-trophy',
            command: () => { router.push('/tournaments'); onMobileToggle && onMobileToggle(false); }
        }
    ];

    return (
        <div
            className={`sidebar-container ${isMobile
                    ? mobileOpen ? 'mobile-open' : 'mobile-closed'
                    : expanded ? 'expanded' : 'collapsed'
                }`}
            onMouseEnter={!isMobile ? () => setExpanded(true) : undefined}
            onMouseLeave={!isMobile ? () => setExpanded(false) : undefined}
        >
            <div className="flex flex-column align-items-center mb-3">
                <img
                    src="/shield.png"
                    alt="Logo"
                    className="sidebar-logo"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/120x120?text=Logo'}
                    onClick={() => { router.push('/'); onMobileToggle && onMobileToggle(false); }}
                />
                {(!isMobile && expanded || isMobile && mobileOpen) && (
                    <h2 className="text-xl font-bold mt-2">Bohurt Argentina</h2>
                )}
            </div>
            <Menu model={menuItems} className="w-full" />
        </div>
    );
};

export default Sidebar;
