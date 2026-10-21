import { AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { useRouter } from 'next/router';
import { getYoutubeEmbedUrl } from '@/utils/youtube';

function LinkEntidad({ href, nombre, logo }) {
  const router = useRouter();
  const content = (
    <span className="inline-flex align-items-center gap-2">
      {logo && (
        <img
          src={logo}
          alt={nombre}
          style={{ width: '20px', height: '20px', objectFit: 'contain' }}
        />
      )}
      <span>{nombre}</span>
    </span>
  );

  if (!href) return content;
  return (
    <span
      className="text-primary cursor-pointer hover:underline"
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        router.push(href);
      }}
    >
      {content}
    </span>
  );
}

export function useCombateInfo(combate, modalidad, torneoId) {
  const isIndividual = [2, 3].includes(modalidad);

  const entidadAId = isIndividual ? combate.idUsuarioA : combate.idEquipoA;
  const entidadBId = isIndividual ? combate.idUsuarioB : combate.idEquipoB;

  const entidadANombre = isIndividual
    ? `${combate.nombreUsuarioA || ''} ${combate.apellidoUsuarioA || ''}`.trim() || 'Peleador A'
    : combate.nombreEquipoA || 'Equipo A';

  const esBye = isIndividual && !combate.idUsuarioB;
  const entidadBNombre = isIndividual
    ? esBye
      ? 'BYE'
      : `${combate.nombreUsuarioB || ''} ${combate.apellidoUsuarioB || ''}`.trim() || 'Peleador B'
    : combate.nombreEquipoB || 'Equipo B';

  const logoA = !isIndividual ? combate.logoEquipoA : null;
  const logoB = !isIndividual ? combate.logoEquipoB : null;

  let entidadGanadorNombre = null;
  if (isIndividual) {
    if (combate.idUsuarioGanador) {
      if (combate.idUsuarioGanador === combate.idUsuarioA) {
        entidadGanadorNombre = entidadANombre;
      } else if (combate.idUsuarioGanador === combate.idUsuarioB) {
        entidadGanadorNombre = entidadBNombre;
      } else if (combate.nombreUsuarioGanador) {
        entidadGanadorNombre = `${combate.nombreUsuarioGanador} ${combate.apellidoUsuarioGanador || ''}`.trim();
      }
    }
  } else {
    entidadGanadorNombre = combate.nombreEquipoGanador || combate.nombreGanador || null;
  }

  const hrefA = isIndividual
    ? entidadAId
      ? `/peleadores/${entidadAId}`
      : null
    : torneoId && entidadAId
    ? `/tournaments/${torneoId}/teams/${entidadAId}`
    : null;

  const hrefB = isIndividual
    ? entidadBId
      ? `/peleadores/${entidadBId}`
      : null
    : torneoId && entidadBId
    ? `/tournaments/${torneoId}/teams/${entidadBId}`
    : null;

  return {
    isIndividual,
    esBye,
    entidadAId,
    entidadBId,
    entidadANombre,
    entidadBNombre,
    logoA,
    logoB,
    entidadGanadorNombre,
    hrefA,
    hrefB,
  };
}

export function CombateAccordionHeader({ combate, modalidad, torneoId }) {
  const {
    isIndividual,
    esBye,
    entidadANombre,
    entidadBNombre,
    logoA,
    logoB,
    entidadGanadorNombre,
    hrefA,
    hrefB,
  } = useCombateInfo(combate, modalidad, torneoId);

  return (
    <div className="flex flex-wrap align-items-center gap-2">
      <Tag value={`Combate ${combate.orden ?? ''}`} severity="secondary" />
      {combate.fase && <Tag value={combate.fase} severity="info" />}
      {combate.grupo && <Tag value={`Grupo ${combate.grupo}`} severity="warning" />}
      {combate.ronda && <Tag value={combate.ronda} severity="info" />}
      <span className="font-semibold flex align-items-center gap-1">
        <LinkEntidad href={hrefA} nombre={entidadANombre} logo={logoA} />
        <span className="text-color-secondary mx-1">vs</span>
        <LinkEntidad href={hrefB} nombre={entidadBNombre} logo={logoB} />
      </span>
      {esBye && <Tag value="BYE / Descansa" severity="secondary" />}
      {entidadGanadorNombre ? (
        <Tag
          value={`Ganó ${entidadGanadorNombre}${
            combate.roundsGanadosGanador != null && combate.roundsGanadosPerdedor != null
              ? ` (${combate.roundsGanadosGanador} - ${combate.roundsGanadosPerdedor})`
              : ''
          }`}
          severity="success"
        />
      ) : combate.finalizado ? (
        <Tag value="Empate" severity="warning" />
      ) : null}
    </div>
  );
}

export function CombateAccordionContent({ combate, modalidad, torneoId }) {
  const {
    isIndividual,
    entidadANombre,
    entidadBNombre,
    entidadGanadorNombre,
  } = useCombateInfo(combate, modalidad, torneoId);

  const embed = getYoutubeEmbedUrl(combate.link);

  return (
    <div>
      {entidadGanadorNombre ? (
        <p className="mb-3">
          <strong>Ganador:</strong> {entidadGanadorNombre}
          {combate.roundsGanadosGanador != null && combate.roundsGanadosPerdedor != null && (
            <span> ({combate.roundsGanadosGanador} - {combate.roundsGanadosPerdedor})</span>
          )}
        </p>
      ) : combate.finalizado ? (
        <p className="mb-3">
          <strong>Resultado:</strong> Empate
        </p>
      ) : null}

      {combate.link && (
        <div className="mb-3">
          {embed ? (
            <div
              className="video-container mb-3"
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                maxWidth: '100%',
              }}
            >
              <iframe
                src={embed}
                title={`Video combate ${combate.orden}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
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
        <DataTable value={combate.rounds} size="small" stripedRows responsiveLayout="scroll">
          <Column field="round" header="Round" style={{ width: '5rem' }} />
          <Column
            header="Ganador"
            body={(row) => {
              if (isIndividual) {
                if (!row.idUsuarioGanador) return <span className="text-color-secondary">Empate</span>;
                if (row.idUsuarioGanador === combate.idUsuarioA) return entidadANombre;
                if (row.idUsuarioGanador === combate.idUsuarioB) return entidadBNombre;
                return 'Ganador';
              }
              if (!row.idEquipoGanador && !row.nombreEquipoGanador) {
                return <span className="text-color-secondary">Empate</span>;
              }
              return row.nombreEquipoGanador || '-';
            }}
          />
          <Column
            header={entidadANombre}
            body={(row) => {
              if (!isIndividual) return row.puntosEquipoA ?? '-';
              if (row.puntosEquipoA !== undefined) return row.puntosEquipoA;
              if (!row.idUsuarioGanador) return row.puntosGanador ?? row.puntosA ?? '-';
              return row.idUsuarioGanador === combate.idUsuarioA
                ? (row.puntosGanador ?? '-')
                : (row.puntosPerdedor ?? '-');
            }}
            style={{ width: '8rem' }}
          />
          <Column
            header={entidadBNombre}
            body={(row) => {
              if (!isIndividual) return row.puntosEquipoB ?? '-';
              if (row.puntosEquipoB !== undefined) return row.puntosEquipoB;
              if (!row.idUsuarioGanador) return row.puntosPerdedor ?? row.puntosB ?? '-';
              return row.idUsuarioGanador === combate.idUsuarioB
                ? (row.puntosGanador ?? '-')
                : (row.puntosPerdedor ?? '-');
            }}
            style={{ width: '8rem' }}
          />
          {!isIndividual && (
            <Column
              header="Hombres en pie (A / B)"
              body={(row) =>
                row.hombresEnPieA != null || row.hombresEnPieB != null
                  ? `${row.hombresEnPieA ?? 0} - ${row.hombresEnPieB ?? 0}`
                  : '-'
              }
              style={{ width: '12rem' }}
            />
          )}
        </DataTable>
      ) : (
        <p className="m-0 text-color-secondary">Sin rounds registrados.</p>
      )}
    </div>
  );
}

export default function CombateAccordionItem({ combate, modalidad, torneoId }) {
  return (
    <AccordionTab
      key={combate.id || combate.orden}
      header={<CombateAccordionHeader combate={combate} modalidad={modalidad} torneoId={torneoId} />}
    >
      <CombateAccordionContent combate={combate} modalidad={modalidad} torneoId={torneoId} />
    </AccordionTab>
  );
}