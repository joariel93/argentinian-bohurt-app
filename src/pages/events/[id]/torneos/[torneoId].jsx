import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import apiService from '@/services/apiService';
import SeoHead from '@/components/common/SeoHead';

const STATUS_SEVERITY = {
  Pendiente: 'info',
  'En curso': 'warning',
  Finalizado: 'success',
};

function formatDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-AR');
}

function ColorDots({ colores = [], size = '0.8rem' }) {
  return (
    <span className="flex gap-1 align-items-center">
      {colores.slice(0, 3).map((c, i) => (
        <span
          key={i}
          className="border-circle"
          style={{ width: size, height: size, backgroundColor: c.hex || '#666' }}
        />
      ))}
    </span>
  );
}

function CombatCardFull({ combate, modalidad }) {
  const isIndividual = [2, 3].includes(modalidad);
  const esBye = isIndividual && combate.idUsuarioB === null;
  const finalizado = combate.finalizado;

  return (
    <div
      className="p-3 border-round mb-2"
      style={{ border: '1px solid var(--surface-border)' }}
    >
      <div className="flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <span className="text-xs text-color-secondary">
          #{combate.orden}
          {combate.fase ? ` · ${combate.fase}` : ''}
          {combate.grupo ? ` · Grupo ${combate.grupo}` : ''}
          {combate.ronda ? ` · ${combate.ronda}` : ''}
        </span>
        <div className="flex align-items-center gap-2">
          {combate.rounds?.length > 0 && (
            <Tag value={`${combate.rounds.length} rounds`} severity="info" />
          )}
          {esBye && <Tag value="Descansa" severity="secondary" />}
          {finalizado && <Tag value="Finalizado" severity="success" />}
          {!finalizado && !esBye && combate.rounds?.length === 0 && (
            <Tag value="Pendiente" severity="warning" />
          )}
          {combate.link && (
            <Button
              icon="pi pi-video"
              rounded
              text
              tooltip="Ver link de transmisión"
              onClick={() => combate.link && window.open(combate.link, '_blank')}
            />
          )}
        </div>
      </div>

      <div className="grid align-items-center">
        <div className="col-12 md:col-5 flex align-items-center gap-2">
          {isIndividual ? (
            <>
              <ColorDots colores={combate.usuarioA?.colores || []} />
              <span
                className={
                  finalizado && combate.idUsuarioGanador === combate.idUsuarioA ? 'font-bold' : ''
                }
              >
                {combate.usuarioA?.nombre} {combate.usuarioA?.apellido}
              </span>
            </>
          ) : (
            <>
              {combate.equipoA?.logo && (
                <img
                  src={combate.equipoA.logo}
                  alt={combate.equipoA.nombre}
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
              )}
              <span
                className={
                  finalizado && combate.idEquipoGanador === combate.idEquipoA ? 'font-bold' : ''
                }
              >
                {combate.equipoA?.nombre}
              </span>
            </>
          )}
        </div>

        <div className="col-12 md:col-2 flex flex-column align-items-center justify-content-center">
          {esBye ? (
            <span className="text-xs text-color-secondary">pasa automático</span>
          ) : finalizado ? (
            <span className="text-sm font-bold" style={{ color: 'var(--green-500)' }}>
              {combate.roundsGanadosGanador} - {combate.roundsGanadosPerdedor}
            </span>
          ) : (
            <span className="text-xs text-color-secondary">vs</span>
          )}
        </div>

        <div className="col-12 md:col-5 flex align-items-center gap-2">
          {isIndividual ? (
            <>
              <ColorDots colores={combate.usuarioB?.colores || []} />
              <span
                className={
                  finalizado && combate.idUsuarioGanador === combate.idUsuarioB ? 'font-bold' : ''
                }
              >
                {combate.usuarioB?.nombre} {combate.usuarioB?.apellido}
              </span>
            </>
          ) : (
            <>
              {combate.equipoB?.logo && (
                <img
                  src={combate.equipoB.logo}
                  alt={combate.equipoB.nombre}
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
              )}
              <span
                className={
                  finalizado && combate.idEquipoGanador === combate.idEquipoB ? 'font-bold' : ''
                }
              >
                {combate.equipoB?.nombre}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const TorneoDetailPage = () => {
  const router = useRouter();
  const { id, torneoId } = router.query;
  const [evento, setEvento] = useState(null);
  const [combates, setCombates] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const data = await apiService.fetchEvent(id);
      if (!data || data.error) {
        router.replace('/events');
        return;
      }
      setEvento(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const torneo = useMemo(
    () => evento?.torneos?.find((t) => t.id === torneoId) || null,
    [evento, torneoId]
  );

  useEffect(() => {
    if (!torneoId || !torneo) return;
    const load = async () => {
      const isIndividual = [2, 3].includes(torneo.idModalidad);
      const [combatesData, estadisticasData] = await Promise.all([
        isIndividual
          ? apiService.fetchCombatesIndividuales(torneoId)
          : apiService.fetchCombatesByTorneo(torneoId).catch(() => ({ combates: [] })),
        apiService.fetchTorneoEstadisticas(torneoId).catch(() => ({})),
      ]);
      setCombates(combatesData.combates || []);
      setEstadisticas(estadisticasData || {});
    };
    load();
  }, [torneoId, torneo]);

  if (loading || !evento) {
    return (
      <>
        <SeoHead title="Cargando..." pathname="/events" />
        <div className="card">
          <Skeleton width="100%" height="200px" className="mb-3" />
          <Skeleton width="60%" height="2rem" className="mb-2" />
          <Skeleton width="40%" height="1.5rem" />
        </div>
      </>
    );
  }

  if (!torneo) {
    return (
      <>
        <SeoHead title="Torneo no encontrado" pathname="/events" />
        <div className="card">
          <h1>Torneo no encontrado</h1>
          <Button label="Volver al evento" icon="pi pi-arrow-left" onClick={() => router.push(`/events/${id}`)} />
        </div>
      </>
    );
  }

  const description = `${torneo.modalidad} ${torneo.categoria} ${torneo.genero} - ${evento.nombre}`;
  const isIndividual = [2, 3].includes(torneo.idModalidad);

  return (
    <>
      <SeoHead
        title={`${torneo.modalidad} - ${evento.nombre}`}
        description={description}
        pathname={`/events/${id}/torneos/${torneoId}`}
      />

      <div className="card">
        <Button
          label="Volver al evento"
          icon="pi pi-arrow-left"
          className="p-button-text mb-3"
          onClick={() => router.push(`/events/${id}`)}
        />

        <div className="evento-banner mb-4" style={{ position: 'relative' }}>
          {evento.imagen && (
            <img
              src={evento.imagen}
              alt={evento.nombre}
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px' }}
            />
          )}
          <div className="absolute" style={{ top: '1rem', right: '1rem' }}>
            <Tag value={torneo.estado || 'Pendiente'} severity={STATUS_SEVERITY[torneo.estado] || 'info'} />
          </div>
        </div>

        <h1 className="m-0">{evento.nombre}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-color-secondary">
          <span><i className="pi pi-calendar mr-1" />{formatDate(evento.fechaEvento)}</span>
          <span><i className="pi pi-map-marker mr-1" />{evento.localizacion}</span>
        </div>

        <h2 className="mt-4">{torneo.modalidad} · {torneo.categoria} · {torneo.genero}</h2>
        <p className="text-color-secondary m-0">
          Formato: {torneo.tipoTorneo || 'A definir'}
        </p>

        <div className="mt-4">
          <h3 className="mt-0">Combates</h3>
          {combates.length === 0 ? (
            <p className="text-color-secondary text-sm">Aún no hay combates generados.</p>
          ) : (
            combates.map((c) => (
              <CombatCardFull key={c.id} combate={c} modalidad={torneo.idModalidad} />
            ))
          )}
        </div>

        <div className="mt-4">
          <h3 className="mt-0">Posiciones</h3>
          {estadisticas.equipos?.length > 0 ? (
            <DataTable value={estadisticas.equipos} size="small">
              <Column field="posicion" header="#" style={{ width: '3rem' }} />
              <Column header={isIndividual ? 'Peleador' : 'Equipo'} field="nombre" />
              <Column field="combates" header="Combates" style={{ width: '6rem' }} />
              <Column field="victorias" header="Victorias" style={{ width: '6rem' }} />
              <Column field="derrotas" header="Derrotas" style={{ width: '6rem' }} />
              <Column field="roundsGanados" header="R. Ganados" style={{ width: '6rem' }} />
              <Column field="roundsPerdidos" header="R. Perdidos" style={{ width: '6rem' }} />
            </DataTable>
          ) : (
            <p className="text-color-secondary text-sm">Aún no hay posiciones calculadas.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default TorneoDetailPage;
