import { useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Fieldset } from 'primereact/fieldset';
import { Tag } from 'primereact/tag';
import PosicionesTable from './PosicionesTable';
import Bracket from './Bracket';
import CombateAccordionItem from './CombateAccordionItem';

function campeonDeCategoriaData(estadisticas, idModalidad) {
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

function formatoNombre(id) {
  if (id === 1) return 'Grupos + Eliminatoria';
  if (id === 2) return 'Eliminatoria directa';
  if (id === 3) return 'Liga';
  return null;
}

export default function TorneoTabSections({ torneo, combates, estadisticas }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const isIndividual = [2, 3].includes(torneo.idModalidad);

  const camp = campeonDeCategoriaData(estadisticas, torneo.idModalidad);

  const gruposMap = new Map();
  (estadisticas?.items || []).forEach((it) => {
    const grupo = it.grupo || 'General';
    if (!gruposMap.has(grupo)) gruposMap.set(grupo, []);
    gruposMap.get(grupo).push(it);
  });
  const grupos = [...gruposMap.entries()];

  const elimCombates = combates.filter((c) => c.fase === 'eliminatoria' || c.ronda);

  return (
    <div>
      {/* Campeón */}
      <Fieldset legend="Campeón" toggleable={false}>
        {camp ? (
          <div className="flex align-items-center gap-3">
            <i className="pi pi-trophy" style={{ fontSize: '2rem', color: '#ffd700' }} />
            {camp.logo && (
              <img src={camp.logo} alt={camp.nombre} width="56" height="56" className="border-circle" />
            )}
            <div>
              <div className="text-sm text-color-secondary">Campeón del torneo</div>
              <div className="text-xl font-bold">{camp.nombre}</div>
            </div>
          </div>
        ) : (
          <p className="m-0 text-color-secondary">Sin campeón definido.</p>
        )}
      </Fieldset>
      <br />

      {/* Tabla de posiciones */}
      <Fieldset legend="Tabla de posiciones" toggleable={false}>
        {estadisticas?.items?.length > 0 ? (
          <PosicionesTable items={estadisticas.items} modalidad={torneo.idModalidad} />
        ) : (
          <p className="m-0 text-color-secondary">Sin posiciones calculadas.</p>
        )}
      </Fieldset>
      <br />

      {/* Fase de grupos (solo si modalidad es Grupos + Eliminatoria) */}
      {torneo.idTipoTorneo === 1 && grupos.length > 0 && (
        <>
          <Fieldset legend="Fase de grupos" toggleable={false}>
            {grupos.map(([grupo, itemsGrupo]) => (
              <div key={grupo} className="mb-3">
                {grupo !== 'General' && (
                  <div className="mb-2">
                    <Tag value={grupo} severity="secondary" />
                  </div>
                )}
                <PosicionesTable items={itemsGrupo} modalidad={torneo.idModalidad} />
              </div>
            ))}
          </Fieldset>
          <br />
        </>
      )}

      {/* Eliminatorias (si hay combates con fase/ronda) */}
      {elimCombates.length > 0 && (
        <>
          <Fieldset legend="Eliminatorias" toggleable={false}>
            <Bracket combates={elimCombates} modalidad={torneo.idModalidad} />
          </Fieldset>
          <br />
        </>
      )}

      {/* Combates */}
      <Fieldset legend={`Combates (${combates.length})`} toggleable={false}>
        {combates.length > 0 ? (
          <Accordion
            multiple
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
          >
            {combates.map((combate) => (
              <CombateAccordionItem
                key={combate.id}
                combate={combate}
                modalidad={torneo.idModalidad}
                torneoId={torneo.id}
              />
            ))}
          </Accordion>
        ) : (
          <p className="m-0 text-color-secondary">No hay combates registrados.</p>
        )}
      </Fieldset>
    </div>
  );
}