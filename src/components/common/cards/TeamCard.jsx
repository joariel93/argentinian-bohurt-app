import React from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useRouter } from 'next/router';
import { getModalidadIcon } from '@/utils/modalidadIcons';

const TeamCard = ({ team }) => {
    const router = useRouter();
    const handleCardClick = () => {
        if (!team.modalidades || team.modalidades.length === 0) {
            sessionStorage.setItem('clubNav', JSON.stringify({ id: team.id, nombre: team.nombre }));
            router.push(`/clubs/${encodeURIComponent(team.nombre)}`);
        } else {
            sessionStorage.setItem('teamNav', JSON.stringify({ id: team.id, nombre: team.nombre }));
            router.push(`/team/${encodeURIComponent(team.nombre)}`);
        }
    };

    if (!team) return null;
    const flag = team.country ? 'flag flag-'.concat(team.country) : undefined


    return (
        <div className="col-12 sm:col-6 lg:col-4 xl:col-3 p-2" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="border-1 surface-border surface-card border-round">
                <div className="flex flex-column align-items-center py-2 relative">
                    <div className="p-overlay-badge" style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{ width: '100%', maxWidth: '20rem', aspectRatio: '1', position: 'relative', margin: '0 auto' }}>
                            <img
                                src={team.logo || '/flag_placeholder.png'}
                                alt={team.nombre}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                onError={(e) => e.target.src = '/flag_placeholder.png'}
                            />
                            {team.modalidades && team.modalidades.length > 0 && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        zIndex: 1,
                                        display: 'flex',
                                        gap: '0.25rem',
                                    }}
                                >
                                    {team.modalidades.map((m) => {
                                        const icon = getModalidadIcon(m.id);
                                        return (
                                            <div
                                                key={m.id}
                                                style={{
                                                    width: '2rem',
                                                    height: '2rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '0.25rem',
                                                    background: team.esMasculino ? '#368fd8ff' : '#f86596ff',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                                }}
                                            >
                                                <img
                                                    src={icon.src}
                                                    alt={m.nombre}
                                                    title={m.nombre}
                                                    style={{ width: '1.5rem', height: '1.5rem' }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {team.country && (
                                <Tag
                                    style={{
                                        background: 'none',
                                        position: 'absolute',
                                        top: '0.25rem',
                                        right: '0.25rem',
                                        zIndex: 1
                                    }}
                                >
                                    <img alt="Country" src="/flag_placeholder.png"
                                        className={flag} style={{ width: '100%' }} />
                                </Tag>
                            )}
                        </div>
                    </div>
                    <div className="text-uppercase font-bold text-sm sm:text-base l:text-l lg:text-lg xl:text-xl">
                        {team.nombre}
                    </div>
                    {team.ciudad && (
                        <span>{team.ciudad}, {team.provincia}</span>
                    )}
                </div>
                <div className="flex align-items-center justify-content-around p-3">
                    <div className="social-icons">
                        {team.redesSociales.map((redSocial) => (
                            <Button
                                key={redSocial.platform}
                                icon={redSocial.iconClass}
                                className="p-button-rounded mx-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(redSocial.url, '_blank');
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamCard;
