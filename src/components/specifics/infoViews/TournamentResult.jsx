import React from 'react';
import { useRouter } from 'next/router';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Fieldset } from 'primereact/fieldset';
import { Image } from 'primereact/image';
import { Tag } from 'primereact/tag';
import Bracket from './Bracket';
import PosicionesTable from './PosicionesTable';
import { getYoutubeEmbedUrl } from '@/utils/youtube';

function formatDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function obtenerModo(idTipoTorneo, tipoTorneo) {
  if (idTipoTorneo === 1) return 'grupos';
  if (idTipoTorneo === 2) return 'eliminatoria';
  if (idTipoTorneo === 3) return 'liga';

  const nombre = (tipoTorneo || '').toLowerCase();
  if (nombre.includes('grupos') && nombre.includes('eliminatoria')) return 'grupos';
  if (nombre.includes('eliminatoria')) return 'eliminatoria';
  return 'liga';
}

function EquipoLink({ tournamentId, equipoId, nombre }) {
  const router = useRouter();
  if (!tournamentId || !equipoId) return <span>{nombre}</span>;
  return (
    <span
      className="text-primary cursor-pointer"
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/tournaments/${tournamentId}/teams/${equipoId}`);
      }}
    >
      {nombre}
    </span>
  );
}

export default function TournamentResult({ tournament, combates, estadisticas }) {
  const router = useRouter();
  const { tournamentId } = router.query;
  const {
    nombre, imagen, localizacion, fechaTorneo, modalidad, sexo,
    categoria, tipoTorneo, idTipoTorneo, reglamento, redesSociales, campeon,
    linkTransmision,
  } = tournament;

  const embedTransmision = getYoutubeEmbedUrl(linkTransmision);

  const equipos = estadisticas?.equipos || [];
  const modo = obtenerModo(idTipoTorneo, tipoTorneo);

  const gruposMap = new Map();
  equipos.forEach((eq) => {
    const grupo = eq.grupo || 'General';
    if (!gruposMap.has(grupo)) gruposMap.set(grupo, []);
    gruposMap.get(grupo).push(eq);
  });
  const grupos = [...gruposMap.entries()];

  const eliminatoriaCombates = combates.filter((c) => c.fase === 'eliminatoria' || c.ronda);

  return (
    <div className="card">
      <div className="flex flex-column align-items-center mb-3">
        {imagen && <Image src={imagen} alt={nombre} width="120" className="mb-2" />}
        <h1 className="m-0 text-center">{nombre}</h1>
        <div className="flex flex-wrap align-items-center justify-content-center gap-3 mt-2">
          {localizacion && (
            <span className="text-color-secondary">
              <i className="pi pi-map-marker mr-1" />{localizacion}
            </span>
          )}
          {fechaTorneo && (
            <span className="text-color-secondary">
              <i className="pi pi-calendar mr-1" />{formatDate(fechaTorneo)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap align-items-center justify-content-center gap-2 mt-2">
          {modalidad && <Tag value={modalidad} severity="info" />}
          {categoria && <Tag value={categoria} severity="info" />}
          {sexo && <Tag value={sexo} severity="info" />}
          {tipoTorneo && <Tag value={tipoTorneo} severity="warning" />}
        </div>
      </div>

      {embedTransmision && (
        <>
          <Fieldset legend="Transmisión en vivo" toggleable={false}>
            <div className="video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
              <iframe
                src={embedTransmision}
                title="Transmisión en vivo"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Fieldset>
          <br />
        </>
      )}

      {(reglamento || (redesSociales && redesSociales.length > 0)) && (
        <>
          <Fieldset legend="Links" toggleable>
            <div className="flex flex-wrap align-items-center gap-3">
              {reglamento && reglamento.link && (
                <Button
                  label={reglamento.nombre || 'Reglamento'}
                  icon="pi pi-book"
                  className="p-button-outlined"
                  onClick={() => window.open(reglamento.link, '_blank')}
                />
              )}
              {redesSociales && redesSociales.length > 0 && (
                <div className="social-icons">
                  {redesSociales.map((redSocial) => (
                    <Button
                      key={redSocial.platform}
                      icon={redSocial.iconClass}
                      className="p-button-outlined mx-1"
                      title={redSocial.platform}
                      onClick={() => window.open(redSocial.url, '_blank')}
                    />
                  ))}
                </div>
              )}
            </div>
          </Fieldset>
          <br />
        </>
      )}

      <Fieldset legend="Campeón" toggleable={false}>
        {campeon ? (
          <div className="flex align-items-center gap-3">
            <i className="pi pi-trophy" style={{ fontSize: '2rem', color: '#ffd700' }} />
            {campeon.logo && (
              <Image src={campeon.logo} alt={campeon.nombre} width="56" height="56" className="border-circle" />
            )}
            <div>
              <div className="text-sm text-color-secondary">Campeón del torneo</div>
              <div className="text-xl font-bold">{campeon.nombre}</div>
            </div>
          </div>
        ) : (
          <p className="m-0 text-color-secondary">Sin campeón definido.</p>
        )}
      </Fieldset>
      <br />

      {modo === 'liga' && (
        <>
          <Fieldset legend="Tabla de posiciones" toggleable={false}>
            <PosicionesTable equipos={equipos} />
          </Fieldset>
          <br />
        </>
      )}

      {modo === 'eliminatoria' && (
        <>
          <Fieldset legend="Eliminatorias" toggleable={false}>
            <Bracket combates={eliminatoriaCombates.length > 0 ? eliminatoriaCombates : combates} />
          </Fieldset>
          <br />
        </>
      )}

      {modo === 'grupos' && (
        <>
          <Fieldset legend="Fase de grupos" toggleable={false}>
            {grupos.length > 0 ? (
              grupos.map(([grupo, equiposGrupo]) => (
                <div key={grupo} className="mb-3">
                  {grupo !== 'General' && (
                    <div className="mb-2">
                      <Tag value={grupo} severity="secondary" />
                    </div>
                  )}
                  <PosicionesTable equipos={equiposGrupo} />
                </div>
              ))
            ) : (
              <p className="m-0 text-color-secondary">Sin equipos en la fase de grupos.</p>
            )}
          </Fieldset>
          <br />

          <Fieldset legend="Eliminatorias" toggleable={false}>
            <Bracket combates={eliminatoriaCombates} />
          </Fieldset>
          <br />
        </>
      )}

      <Fieldset legend={`Combates (${combates.length})`} toggleable={false}>
        {combates.length > 0 ? (
          <Accordion>
            {combates.map((combate) => (
              <AccordionTab
                key={combate.id}
                header={
                  <div className="flex flex-wrap align-items-center gap-2">
                    <Tag value={`Combate ${combate.orden}`} severity="secondary" />
                    <span className="font-semibold">
                      <EquipoLink tournamentId={tournamentId} equipoId={combate.idEquipoA} nombre={combate.nombreEquipoA} />
                      {' vs '}
                      <EquipoLink tournamentId={tournamentId} equipoId={combate.idEquipoB} nombre={combate.nombreEquipoB} />
                    </span>
                    {combate.finalizado && combate.nombreEquipoGanador && (
                      <Tag value={`Ganó ${combate.nombreEquipoGanador}`} severity="success" />
                    )}
                  </div>
                }
              >
                {combate.finalizado && (
                  <p className="mb-3">
                    <strong>Ganador:</strong> {combate.nombreEquipoGanador} ({combate.roundsGanadosGanador} - {combate.roundsGanadosPerdedor})
                  </p>
                )}
                {combate.link && (
                  <div className="mb-3">
                    {getYoutubeEmbedUrl(combate.link) ? (
                      <div className="video-container mb-3" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
                        <iframe
                          src={getYoutubeEmbedUrl(combate.link)}
                          title={`Video combate ${combate.orden}`}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <Button
                        label="Ver transmisión"
                        icon="pi pi-video"
                        className="p-button-outlined p-button-sm"
                        onClick={() => window.open(combate.link, '_blank')}
                      />
                    )}
                  </div>
                )}
                {combate.rounds && combate.rounds.length > 0 ? (
                  <DataTable value={combate.rounds} size="small" stripedRows>
                    <Column field="round" header="Round" style={{ width: '6rem' }} />
                    <Column header="Ganador" body={(row) => row.nombreEquipoGanador || '-'} />
                    <Column
                      header={combate.nombreEquipoA}
                      body={(row) => row.puntosEquipoA}
                      style={{ width: '8rem' }}
                    />
                    <Column
                      header={combate.nombreEquipoB}
                      body={(row) => row.puntosEquipoB}
                      style={{ width: '8rem' }}
                    />
                  </DataTable>
                ) : (
                  <p className="m-0 text-color-secondary">Sin rounds registrados.</p>
                )}
              </AccordionTab>
            ))}
          </Accordion>
        ) : (
          <p className="m-0 text-color-secondary">No hay combates registrados.</p>
        )}
      </Fieldset>
    </div>
  );
}
