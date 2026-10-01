import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import apiService from '@/services/apiService';
import SeoHead from '@/components/common/SeoHead';
import PosicionesTable from '@/components/specifics/infoViews/PosicionesTable';
import Bracket from '@/components/specifics/infoViews/Bracket';
import CombateAccordionItem from '@/components/specifics/infoViews/CombateAccordionItem';

function formatoNombre(id) {
  if (id === 1) return 'Grupos + Eliminatoria';
  if (id === 2) return 'Eliminatoria directa';
  if (id === 3) return 'Liga';
  return null;
}

// Devuelve el campeón (posición 1) si existe, según la modalidad.
function campeonDeCategoria(estadisticas, idModalidad) {
  const items = estadisticas?.items || [];
  if (items.length === 0) return null;
  const isIndividual = [2, 3].includes(idModalidad);
  const ganador = items.find((it) => it.posicion === 1) || items[0];
  if (!ganador) return null;
  if (isIndividual) {
    return {
      nombre: `${ganador.apellido}, ${ganador.nombre}${ganador.clubNombre ? ' (' + ganador.clubNombre + ')' : ''}`,
      logo: null,
    };
  }
  return {
    nombre: ganador.nombre || ganador.id,
    logo: ganador.logo || null,
  };
}

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

function CombatCardPublic({ combate, modalidad }) {
  const isIndividual = [2, 3].includes(modalidad);
  const esBye = isIndividual && combate.idUsuarioB === null;

  if (esBye) {
    return (
      <div
        className="p-3 border-round mb-2"
        style={{ border: '1px solid var(--surface-border)', background: 'var(--surface-50)' }}
      >
        <div className="flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
          <span className="text-xs text-color-secondary">
            #{combate.orden}
            {combate.fase ? ` · ${combate.fase}` : ''}
            {combate.ronda ? ` · ${combate.ronda}` : ''}
          </span>
          <Tag value="Descansa" severity="secondary" />
        </div>
        <div className="text-sm">
          {isIndividual ? (
            <span>
              <ColorDots colores={combate.usuarioA?.colores || []} />
              <span className="ml-2 font-bold">
                {combate.usuarioA?.nombre} {combate.usuarioA?.apellido}
              </span>
            </span>
          ) : (
            <span className="font-bold">{combate.equipoA?.nombre}</span>
          )}
          <span className="text-color-secondary ml-2">pasa automáticamente a la siguiente ronda.</span>
        </div>
      </div>
    );
  }

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
              <span className="font-bold text-sm">
                {combate.usuarioA?.nombre} {combate.usuarioA?.apellido}
              </span>
            </>
          ) : (
            <>
              {combate.equipoA?.logo && (
                <img src={combate.equipoA.logo} alt={combate.equipoA.nombre} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              )}
              <span className="font-bold text-sm">{combate.equipoA?.nombre}</span>
            </>
          )}
        </div>

        <div className="col-12 md:col-2 flex flex-column align-items-center justify-content-center">
          {finalizado ? (
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

const EventDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [combatesByTorneo, setCombatesByTorneo] = useState({});
  const [estadisticasByTorneo, setEstadisticasByTorneo] = useState({});
  const [selectedTorneoId, setSelectedTorneoId] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const data = await apiService.fetchEvent(id);
      if (!data || data.error) {
        router.replace('/events');
        return;
      }
      setEvento(data);
      if (data.torneos?.length > 0) setSelectedTorneoId(data.torneos[0].id);
      setLoading(false);
    };
    load();
  }, [id]);

  // Cuando cambia la categoría seleccionada, cargar combates y estadísticas.
  useEffect(() => {
    if (!selectedTorneoId) return;
    if (combatesByTorneo[selectedTorneoId] && estadisticasByTorneo[selectedTorneoId]) return;
    const load = async () => {
      const selectedTorneo = evento?.torneos?.find((t) => t.id === selectedTorneoId);
      if (!selectedTorneo) return;
      const isIndividual = [2, 3].includes(selectedTorneo.idModalidad);
      const [combatesData, estadisticasData] = await Promise.all([
        isIndividual
          ? apiService.fetchCombatesIndividuales(selectedTorneoId)
          : Promise.resolve({ combates: [] }),
        apiService.fetchTorneoEstadisticas(selectedTorneoId),
      ]);
      setCombatesByTorneo((prev) => ({ ...prev, [selectedTorneoId]: combatesData.combates || [] }));
      setEstadisticasByTorneo((prev) => ({ ...prev, [selectedTorneoId]: estadisticasData || {} }));
    };
    load();
  }, [selectedTorneoId, evento, combatesByTorneo, estadisticasByTorneo]);

  const selectedTorneo = useMemo(
    () => evento?.torneos?.find((t) => t.id === selectedTorneoId) || null,
    [evento, selectedTorneoId]
  );
  const selectedCombates = selectedTorneoId ? combatesByTorneo[selectedTorneoId] || [] : [];
  const selectedEstadisticas = selectedTorneoId ? estadisticasByTorneo[selectedTorneoId] || {} : {};

  if (loading) {
    return (
      <>
        <SeoHead title="Cargando..." pathname="/events" />
        <div className="card">
          <Skeleton width="100%" height="300px" className="mb-3" />
          <Skeleton width="60%" height="2rem" className="mb-2" />
          <Skeleton width="40%" height="1.5rem" />
        </div>
      </>
    );
  }

  if (!evento) return null;

  const description = evento.localizacion
    ? `${evento.nombre} en ${evento.localizacion}.`
    : `${evento.nombre} en Argentina.`;

  return (
    <>
      <SeoHead
        title={evento.nombre}
        description={description}
        pathname={`/events/${evento.id}`}
      />

      <div className="card">
        <div className="evento-banner mb-4" style={{ position: 'relative' }}>
          {evento.imagen && (
            <img src={evento.imagen} alt={evento.nombre} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '6px' }} />
          )}
        </div>

        <div className="flex flex-column md:flex-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h1 className="m-0">{evento.nombre}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-color-secondary">
              <span><i className="pi pi-calendar mr-1" />{formatDate(evento.fechaEvento)}</span>
              <span><i className="pi pi-map-marker mr-1" />{evento.localizacion}</span>
              <span><i className="pi pi-clock mr-1" />Inscripciones hasta {formatDate(evento.fechaCierreInscripcion)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {evento.linkTransmision && (
              <Button
                label="Ver en vivo"
                icon="pi pi-video"
                onClick={() => window.open(evento.linkTransmision, '_blank')}
              />
            )}
          </div>
        </div>

        {evento.reglamento && (
          <div className="mb-3">
            <strong>Reglamento: </strong>
            {evento.reglamento.link ? (
              <a href={evento.reglamento.link} target="_blank" rel="noreferrer">{evento.reglamento.nombre}</a>
            ) : (
              evento.reglamento.nombre
            )}
          </div>
        )}

        {evento.redesSociales?.length > 0 && (
          <div className="mb-4 social-icons">
            {evento.redesSociales.map((rs) => (
              <Button
                key={rs.idRedSocial}
                icon={rs.iconClass}
                className="p-button-outlined p-button-rounded mx-1"
                onClick={() => rs.link && window.open(rs.link, '_blank')}
              />
            ))}
          </div>
        )}

        <h2>Categorías</h2>
        {evento.torneos?.length === 0 ? (
          <p className="text-color-secondary">Este evento aún no tiene categorías cargadas.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {evento.torneos.map((t) => (
                <Button
                  key={t.id}
                  label={`${t.modalidad} · ${t.categoria} · ${t.genero}`}
                  icon="pi pi-flag"
                  className={t.id === selectedTorneoId ? '' : 'p-button-outlined'}
                  onClick={() => setSelectedTorneoId(t.id)}
                />
              ))}
            </div>

            {selectedTorneo && (
              <div className="p-3 border-round surface-card">
                <div className="flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <h3 className="m-0">{selectedTorneo.modalidad} · {selectedTorneo.categoria} · {selectedTorneo.genero}</h3>
                  <div className="flex align-items-center gap-2">
                    {(() => {
                      const fmt = formatoNombre(selectedTorneo.tipoTorneo);
                      return fmt ? <Tag value={fmt} severity="info" /> : null;
                    })()}
                  </div>
                </div>

                {(() => {
                  const camp = campeonDeCategoria(selectedEstadisticas, selectedTorneo.idModalidad);
                  return camp ? (
                    <div className="flex align-items-center gap-3 mb-3">
                      <i className="pi pi-trophy" style={{ fontSize: '2rem', color: '#ffd700' }} />
                      {camp.logo && (
                        <img src={camp.logo} alt={camp.nombre} width="56" height="56" className="border-circle" />
                      )}
                      <div>
                        <div className="text-sm text-color-secondary">Campeón del torneo</div>
                          <div className="text-xl font-bold">{camp.nombre}</div>
                        </div>
                      </div>
                  ) : null;
                })()}

                {/* Tabla de posiciones (siempre visible) */}
                <h4 className="mt-0">Tabla de posiciones</h4>
                {selectedEstadisticas.items?.length > 0 ? (
                  <PosicionesTable items={selectedEstadisticas.items} modalidad={selectedTorneo.idModalidad} />
                ) : (
                  <p className="text-color-secondary text-sm">Sin posiciones calculadas.</p>
                )}

                {/* Fase de grupos (si modalidad = Grupos + Eliminatoria) */}
                {selectedTorneo.idTipoTorneo === 1 && (() => {
                    const gruposMap = new Map();
                    (selectedEstadisticas.items || []).forEach((it) => {
                      const grupo = it.grupo || 'General';
                      if (!gruposMap.has(grupo)) gruposMap.set(grupo, []);
                      gruposMap.get(grupo).push(it);
                    });
                    const grupos = [...gruposMap.entries()];
                    if (grupos.length === 0) return null;
                    return (
                      <>
                        <h4>Fase de grupos</h4>
                        {grupos.map(([grupo, itemsGrupo]) => (
                          <div key={grupo} className="mb-3">
                            {grupo !== 'General' && (
                              <div className="mb-2">
                                <Tag value={grupo} severity="secondary" />
                              </div>
                            )}
                            <PosicionesTable items={itemsGrupo} modalidad={selectedTorneo.idModalidad} />
                          </div>
                        ))}
                      </>
                    );
                  })()}

                {/* Eliminatorias (si hay combates con fase/ronda) */}
                {(() => {
                    const elimCombates = selectedCombates.filter(
                      (c) => c.fase === 'eliminatoria' || c.ronda
                    );
                    if (elimCombates.length === 0) return null;
                    return (
                      <>
                        <h4>Eliminatorias</h4>
                        <Bracket combates={elimCombates} modalidad={selectedTorneo.idModalidad} />
                      </>
                    );
                  })()}

                {/* Combates (Accordion) */}
                <h4 className="mt-3">Combates ({selectedCombates.length})</h4>
                {selectedCombates.length > 0 ? (
                  <Accordion>
                    {selectedCombates.map((combate) => (
                      <CombateAccordionItem
                        key={combate.id}
                        combate={combate}
                        modalidad={selectedTorneo.idModalidad}
                        torneoId={selectedTorneo.id}
                      />
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-color-secondary text-sm">No hay combates registrados.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default EventDetailPage;
