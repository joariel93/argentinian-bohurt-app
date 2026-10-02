import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import apiService from '@/services/apiService';
import SeoHead from '@/components/common/SeoHead';

const STATUS_SEVERITY = {
  Pendiente: 'info',
  'En curso': 'warning',
  Finalizado: 'success',
};

const EventsPage = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const data = await apiService.fetchEvents();
      setEventos(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleClick = (id) => router.push(`/events/${id}`);

  if (loading) {
    return (
      <>
        <SeoHead
          title="Eventos"
          description="Próximos eventos de Buhurt y combate medieval histórico en Argentina."
          pathname="/events"
        />
        <div className="card">
          <h1 className="mb-4">Eventos</h1>
          <div className="grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="col-12 md:col-6 lg:col-4 p-3">
                <Skeleton width="100%" height="200px" className="mb-3" />
                <Skeleton width="80%" height="2rem" className="mb-2" />
                <Skeleton width="60%" height="1.5rem" className="mb-3" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title="Eventos"
        description="Próximos eventos de Buhurt y combate medieval histórico en Argentina."
        pathname="/events"
      />
      <div className="card">
        <h1 className="mb-4">Eventos</h1>
        {eventos.length === 0 ? (
          <p className="text-color-secondary">No hay eventos cargados.</p>
        ) : (
          <div className="grid">
            {eventos.map((e) => (
              <div
                key={e.id}
                className="col-12 md:col-6 lg:col-4 p-3"
                onClick={() => handleClick(e.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="torneo-card">
                  <div className="torneo-card-imagen">
                    {e.imagen ? (
                      <img src={e.imagen} alt={e.nombre} />
                    ) : (
                      <div className="flex align-items-center justify-content-center" style={{ height: '200px', background: 'var(--surface-200)' }}>
                        <i className="pi pi-image text-4xl text-color-secondary" />
                      </div>
                    )}
                    <Tag
                      value={e.estado || 'Pendiente'}
                      severity={STATUS_SEVERITY[e.estado] || 'info'}
                      className="torneo-card-estado"
                    />
                  </div>
                  <div className="torneo-card-contenido">
                    <h3 className="torneo-card-titulo">{e.nombre}</h3>
                    <div className="torneo-card-detalles">
                      <div className="torneo-card-detalle">
                        <i className="pi pi-calendar" />
                        <span>{new Date(e.fechaEvento).toLocaleDateString('es-AR')}</span>
                      </div>
                      <div className="evento-card-detalle">
                        <i className="pi pi-map-marker" />
                        <span>{e.localizacion}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(e.modalidades || []).map((m) => (
                        <Tag key={m} value={m} severity="info" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default EventsPage;
