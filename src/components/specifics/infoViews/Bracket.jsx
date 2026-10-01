import React from 'react';
import { useRouter } from 'next/router';
import { Tag } from 'primereact/tag';

function EntidadLink({ modalidad, id, nombre, esGanador }) {
  const router = useRouter();
  const isIndividual = [2, 3].includes(modalidad);
  // El endpoint de detalle de peleador es /peleadores/[id]; de equipo es /tournaments/[id]/teams/[id].
  const href = isIndividual && id
    ? `/peleadores/${id}`
    : id
    ? router.asPath.replace(/\/[^/]+$/, '') + `/teams/${id}`
    : null;
  const handleClick = (e) => {
    e.stopPropagation();
    if (href) router.push(href);
  };
  return (
    <span
      onClick={handleClick}
      className={`${esGanador ? 'font-bold' : ''} text-primary cursor-pointer`}
      style={{ cursor: 'pointer' }}
    >
      {nombre || 'Por definir'}
    </span>
  );
}

function CombateBracket({ combate, modalidad }) {
  const esGanadorA = combate.finalizado && combate.idEquipoGanador === combate.idEquipoA;
  const esGanadorB = combate.finalizado && combate.idEquipoGanador === combate.idEquipoB;

  const isIndividual = [2, 3].includes(modalidad);
  const idA = isIndividual ? combate.idUsuarioA : combate.idEquipoA;
  const idB = isIndividual ? combate.idUsuarioB : combate.idEquipoB;
  const nombreA = isIndividual
    ? `${combate.nombreUsuarioA || ''} ${combate.apellidoUsuarioA || ''}`.trim()
    : combate.nombreEquipoA;
  const nombreB = isIndividual
    ? `${combate.nombreUsuarioB || ''} ${combate.apellidoUsuarioB || ''}`.trim()
    : combate.nombreEquipoB;

  const fila = (nombre, esGanador, id) => (
    <div
      className="flex align-items-center justify-content-between gap-2 px-2 py-1"
      style={{
        borderRadius: '0.25rem',
        background: esGanador ? 'rgba(76, 175, 80, 0.15)' : 'transparent',
        border: esGanador ? '1px solid rgba(76, 175, 80, 0.4)' : '1px solid transparent',
      }}
    >
      <EntidadLink modalidad={modalidad} id={id} nombre={nombre} esGanador={esGanador} />
      {esGanador && <i className="pi pi-check" style={{ color: '#4caf50' }} />}
    </div>
  );

  return (
    <div className="mb-2 p-2 border-1 surface-border border-round">
      {fila(nombreA, esGanadorA, idA)}
      <div className="text-center text-xs text-color-secondary">vs</div>
      {fila(nombreB, esGanadorB, idB)}
    </div>
  );
}

export default function Bracket({ combates, modalidad }) {
  if (!combates || combates.length === 0) {
    return <p className="m-0 text-color-secondary">No hay eliminatorias registradas.</p>;
  }

  const rondas = [];
  const mapa = new Map();
  combates.forEach((combate) => {
    const key = combate.ronda || 'Eliminatoria';
    if (!mapa.has(key)) {
      mapa.set(key, []);
      rondas.push(key);
    }
    mapa.get(key).push(combate);
  });

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {rondas.map((ronda) => (
        <div key={ronda} className="flex-none" style={{ minWidth: '220px' }}>
          <div className="text-center mb-2">
            <Tag value={ronda} severity="info" />
          </div>
          {mapa.get(ronda).map((combate) => (
            <CombateBracket key={combate.id} combate={combate} modalidad={modalidad} />
          ))}
        </div>
      ))}
    </div>
  );
}