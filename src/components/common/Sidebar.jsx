import React, { useState, useEffect } from 'react';
import { Menu } from 'primereact/menu';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = ({ mobileOpen, onMobileToggle, onOverlayClick }) => {
    const [expanded, setExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();
    const { user, isAdmin, logout } = useAuth();

    useEffect(() => {
        const checkViewport = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
        };
        checkViewport();
        window.addEventListener('resize', checkViewport);
        return () => window.removeEventListener('resize', checkViewport);
    }, []);

    const publicItems = [
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

    const adminItems = isAdmin() ? [
        { separator: true },
        {
            label: 'Admin',
            icon: 'pi pi-cog',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-th-large',
                    command: () => { router.push('/admin/dashboard'); onMobileToggle && onMobileToggle(false); }
                },
                {
                    label: 'Clubes',
                    icon: 'pi pi-users',
                    command: () => { router.push('/admin/clubs'); onMobileToggle && onMobileToggle(false); }
                },
                {
                    label: 'Equipos',
                    icon: 'pi pi-shield',
                    command: () => { router.push('/admin/teams'); onMobileToggle && onMobileToggle(false); }
                },
                {
                    label: 'Usuarios',
                    icon: 'pi pi-user',
                    command: () => { router.push('/admin/users'); onMobileToggle && onMobileToggle(false); }
                },
                {
                    label: 'Torneos',
                    icon: 'pi pi-trophy',
                    command: () => { router.push('/admin/tournaments'); onMobileToggle && onMobileToggle(false); }
                },
                {
                    label: 'Noticias',
                    icon: 'pi pi-comments',
                    command: () => { router.push('/admin/news'); onMobileToggle && onMobileToggle(false); }
                }
            ]
        }
    ] : [];

    const authItems = user ? [
        { separator: true },
        {
            label: 'Cerrar sesión',
            icon: 'pi pi-sign-out',
            command: async () => {
                await logout();
                router.push('/');
                onMobileToggle && onMobileToggle(false);
            }
        }
    ] : [];

    const menuItems = [...publicItems, ...adminItems, ...authItems];

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
