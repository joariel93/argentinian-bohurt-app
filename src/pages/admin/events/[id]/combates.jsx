import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import AdminRoute from '@/components/admin/AdminRoute';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

function formatInstancia(torneo) {
  return `${torneo.modalidad} · ${torneo.categoria} · ${torneo.genero}`;
}

function CombatItem({ combate, modalidad }) {
  const isIndividual = [2, 3].includes(modalidad);
  const finalizado = combate.finalizado;

  return (
    <div
      className="p-3 border-round surface-card mb-2"
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
          {combate.rounds.length > 0 && (
            <Tag value={`${combate.rounds.length} rounds`} severity="info" />
          )}
          {finalizado && <Tag value="Finalizado" severity="success" />}
          {!finalizado && combate.rounds.length === 0 && <Tag value="Pendiente" severity="warning" />}
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

      <div className="grid">
        <div className="col-12 md:col-5 flex align-items-center gap-2">
          {isIndividual ? (
            <>
              <div className="flex gap-1">
                {(combate.usuarioA.colores || []).slice(0, 3).map((c, i) => (
                  <span
                    key={i}
                    className="border-circle"
                    style={{ width: '0.8rem', height: '0.8rem', backgroundColor: c.hex || '#666' }}
                  />
                ))}
              </div>
              <span className="font-bold text-sm">
                {combate.usuarioA.nombre} {combate.usuarioA.apellido}
              </span>
            </>
          ) : (
            <>
              {combate.equipoA.logo && (
                <img src={combate.equipoA.logo} alt={combate.equipoA.nombre} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              )}
              <span className="font-bold text-sm">{combate.equipoA.nombre}</span>
            </>
          )}
        </div>

        <div className="col-12 md:col-2 flex flex-column align-items-center justify-content-center">
          {finalizado && (
            <span className="text-sm font-bold" style={{ color: 'var(--green-500)' }}>
              {isIndividual
                ? `${combate.roundsGanadosGanador} - ${combate.roundsGanadosPerdedor}`
                : `${combate.roundsGanadosGanador} - ${combate.roundsGanadosPerdedor}`}
            </span>
          )}
          {!finalizado && <span className="text-xs text-color-secondary">vs</span>}
        </div>

        <div className="col-12 md:col-5 flex align-items-center gap-2">
          {combate.usuarioB === null && combate.equipoB === null ? (
            <span className="text-color-secondary italic text-sm">Descansa</span>
          ) : isIndividual ? (
            <>
              <div className="flex gap-1">
                {(combate.usuarioB?.colores || []).slice(0, 3).map((c, i) => (
                  <span
                    key={i}
                    className="border-circle"
                    style={{ width: '0.8rem', height: '0.8rem', backgroundColor: c.hex || '#666' }}
                  />
                ))}
              </div>
              <span className="font-bold text-sm">
                {combate.usuarioB?.nombre} {combate.usuarioB?.apellido}
              </span>
            </>
          ) : (
            <>
              {combate.equipoB?.logo && (
                <img src={combate.equipoB.logo} alt={combate.equipoB.nombre} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              )}
              <span className="font-bold text-sm">{combate.equipoB?.nombre}</span>
            </>
          )}
        </div>
      </div>

      {finalizado && (
        <div className="mt-2 text-xs text-color-secondary">
          <strong>Ganador: </strong>
          {isIndividual
            ? `${combate.usuarioGanador?.nombre} ${combate.usuarioGanador?.apellido}`
            : combate.equipoGanador?.nombre}
        </div>
      )}
    </div>
  );
}

export default function AdminCombatesPage() {
  const router = useRouter();
  const { id } = router.query;
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [torneos, setTorneos] = useState([]);
  const [selectedTorneoId, setSelectedTorneoId] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const data = await apiService.fetchCombatesByEvento(id);
      if (data?.error) {
        showError(data.error);
        setLoading(false);
        return;
      }
      setTorneos(data.torneos || []);
      const first = (data.torneos || [])[0];
      if (first) setSelectedTorneoId(first.id);
      setLoading(false);
    };
    load();
  }, [id]);

  const selectedTorneo = useMemo(
    () => torneos.find((t) => t.id === selectedTorneoId) || null,
    [torneos, selectedTorneoId]
  );

  const totalCombates = torneos.reduce((acc, t) => acc + (t.combates?.length || 0), 0);
  const finalizados = torneos.reduce(
    (acc, t) => acc + (t.combates?.filter((c) => c.finalizado).length || 0),
    0
  );

  return (
    <AdminRoute>
      <div className="p-4">
        <div className="flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h1 className="text-3xl font-bold m-0">Combates del Evento</h1>
            <p className="text-color-secondary mt-1 m-0">
              {torneos.length} categorías · {totalCombates} combates · {finalizados} finalizados
            </p>
          </div>
          <Button label="Volver al listado" icon="pi pi-arrow-left" className="p-button-text" onClick={() => router.push('/admin/events')} />
        </div>

        {loading ? (
          <div className="flex justify-content-center align-items-center p-6">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          </div>
        ) : torneos.length === 0 ? (
          <div className="p-6 text-center border-round surface-card">
            <i className="pi pi-info-circle text-4xl text-color-secondary mb-3" />
            <p className="text-color-secondary m-0">Este evento aún no tiene categorías cargadas.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {torneos.map((t) => (
                <div key={t.id} className="flex align-items-center gap-1">
                  <Button
                    label={formatInstancia(t)}
                    icon="pi pi-flag"
                    className={t.id === selectedTorneoId ? '' : 'p-button-outlined'}
                    onClick={() => setSelectedTorneoId(t.id)}
                  />
                  <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    tooltip="Editar torneo"
                    onClick={() => router.push(`/admin/tournaments/${t.id}/editar`)}
                  />
                </div>
              ))}
            </div>

            {selectedTorneo && (
              <div>
                <h3 className="mt-0">{formatInstancia(selectedTorneo)}</h3>
                <p className="text-color-secondary text-sm">
                  Tipo: {selectedTorneo.tipoTorneo || 'A definir'} ·{' '}
                  {selectedTorneo.combates.length} combates
                </p>
                {selectedTorneo.combates.length === 0 ? (
                  <div className="p-4 text-center border-round surface-card">
                    <p className="text-color-secondary m-0">Aún no hay combates generados para esta categoría.</p>
                  </div>
                ) : (
                  selectedTorneo.combates.map((c) => (
                    <CombatItem key={c.id} combate={c} modalidad={selectedTorneo.idModalidad} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminRoute>
  );
}
