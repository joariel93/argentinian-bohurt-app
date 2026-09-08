import React from 'react';
import { Tag } from 'primereact/tag';

function CombateBracket({ combate }) {
  const esGanadorA = combate.finalizado && combate.idEquipoGanador === combate.idEquipoA;
  const esGanadorB = combate.finalizado && combate.idEquipoGanador === combate.idEquipoB;

  const fila = (nombre, esGanador) => (
    <div
      className="flex align-items-center justify-content-between gap-2 px-2 py-1"
      style={{
        borderRadius: '0.25rem',
        background: esGanador ? 'rgba(76, 175, 80, 0.15)' : 'transparent',
        border: esGanador ? '1px solid rgba(76, 175, 80, 0.4)' : '1px solid transparent',
      }}
    >
      <span className={esGanador ? 'font-bold' : ''}>{nombre || 'Por definir'}</span>
      {esGanador && <i className="pi pi-check" style={{ color: '#4caf50' }} />}
    </div>
  );

  return (
    <div className="mb-2 p-2 border-1 surface-border border-round">
      {fila(combate.nombreEquipoA, esGanadorA)}
      <div className="text-center text-xs text-color-secondary">vs</div>
      {fila(combate.nombreEquipoB, esGanadorB)}
    </div>
  );
}

export default function Bracket({ combates }) {
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
            <CombateBracket key={combate.id} combate={combate} />
          ))}
        </div>
      ))}
    </div>
  );
}
