import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import apiService from '@/services/apiService';

const TournamentStatusSeverity = {
    'Inscripciones abiertas': 'success',
    'Abierto': 'info',
    'Inscripciones cerradas': 'warning',
    'Finalizado': 'danger',
    'Próximamente': 'info',
};

const TournamentsPage = () => {
    const [torneos, setTorneos] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTorneos = async () => {
            const data = await apiService.fetchTournaments();
            setTorneos(data);
            setLoading(false);
        };
        fetchTorneos();
    }, []);

    const handleTournamentClick = (id) => {
        router.push(`/tournaments/${id}`);
    };

    if (loading) {
        return (
            <div className="card">
                <h1 className="mb-4">Torneos</h1>
                <div className="grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="col-12 md:col-6 lg:col-4 p-3">
                            <Skeleton width="100%" height="200px" className="mb-3" />
                            <Skeleton width="80%" height="2rem" className="mb-2" />
                            <Skeleton width="60%" height="1.5rem" className="mb-3" />
                            <Skeleton width="100%" height="1rem" className="mb-2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h1 className="mb-4">Torneos</h1>
            <div className="grid">
                {torneos.map((torneo) => (
                    <div
                        key={torneo.id}
                        className="col-12 md:col-6 lg:col-4 p-3"
                        onClick={() => handleTournamentClick(torneo.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="torneo-card">
                            <div className="torneo-card-imagen">
                                <img src={torneo.imagen} alt={torneo.nombre} />
                                <Tag
                                    value={torneo.estado}
                                    severity={TournamentStatusSeverity[torneo.estado] || 'info'}
                                    className="torneo-card-estado"
                                />
                            </div>
                            <div className="torneo-card-contenido">
                                <h3 className="torneo-card-titulo">{torneo.nombre}</h3>
                                <div className="torneo-card-detalles">
                                    <div className="torneo-card-detalle">
                                        <i className="pi pi-calendar"></i>
                                        <span>{new Date(torneo.fechaTorneo).toLocaleDateString('es-AR')}</span>
                                    </div>
                                    <div className="torneo-card-detalle">
                                        <i className="pi pi-map-marker"></i>
                                        <span>{torneo.localizacion}</span>
                                    </div>
                                    <div className="torneo-card-detalle">
                                        <i className="pi pi-shield"></i>
                                        <span>{torneo.modalidad} - {torneo.sexo}</span>
                                    </div>
                                </div>
                                <div className="torneo-card-footer">
                                    <span className="torneo-card-equipos">
                                        <i className="pi pi-users mr-2"></i>
                                        {torneo.equiposInscritos} equipos
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TournamentsPage;
