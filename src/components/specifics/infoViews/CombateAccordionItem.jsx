import { AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { useRouter } from 'next/router';
import { getYoutubeEmbedUrl } from '@/utils/youtube';

function LinkEntidad({ href, nombre }) {
  if (!href) return <span>{nombre}</span>;
  return (
    <span
      className="text-primary cursor-pointer"
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        window.location.href = href;
      }}
    >
      {nombre}
    </span>
  );
}

export default function CombateAccordionItem({ combate, modalidad, torneoId }) {
  const router = useRouter();
  const isIndividual = [2, 3].includes(modalidad);

  const entidadAId = isIndividual ? combate.idUsuarioA : combate.idEquipoA;
  const entidadBId = isIndividual ? combate.idUsuarioB : combate.idEquipoB;
  const entidadANombre = isIndividual ? `${combate.nombreUsuarioA} ${combate.apellidoUsuarioA}` : combate.nombreEquipoA;
  const entidadBNombre = isIndividual ? `${combate.nombreUsuarioB} ${combate.apellidoUsuarioB}` : combate.nombreEquipoB;
  const entidadAGanadorId = isIndividual ? combate.idUsuarioGanador : combate.idEquipoGanador;
  const entidadBGanadorId = isIndividual ? combate.idUsuarioGanador : combate.idEquipoGanador;
  const entidadGanadorNombre = isIndividual
    ? combate.idUsuarioGanador === combate.idUsuarioA
      ? `${combate.nombreUsuarioA} ${combate.apellidoUsuarioA}`
      : `${combate.nombreUsuarioB} ${combate.apellidoUsuarioB}`
    : combate.nombreGanador || combate.nombreEquipoGanador;

  // El href apunta a la página de detalle del equipo o del peleador según modalidad.
  // Como los endpoints son distintos según el modelo, no enlazamos automáticamente.
  // Dejamos el nombre como texto (no link) para mantener simple el comportamiento.
  const hrefA = torneoId && entidadAId
    ? `/tournaments/${torneoId}/teams/${entidadAId}`
    : null;
  const hrefB = torneoId && entidadBId
    ? `/tournaments/${torneoId}/teams/${entidadBId}`
    : null;

  const embed = getYoutubeEmbedUrl(combate.link);

  return (
    <AccordionTab
      key={combate.id}
      header={
        <div className="flex flex-wrap align-items-center gap-2">
          <Tag value={`Combate ${combate.orden}`} severity="secondary" />
          <span className="font-semibold">
            <LinkEntidad href={hrefA} nombre={entidadANombre} />
            {' vs '}
            <LinkEntidad href={hrefB} nombre={entidadBNombre} />
          </span>
          {combate.finalizado && entidadGanadorNombre && (
            <Tag value={`Ganó ${entidadGanadorNombre}`} severity="success" />
          )}
        </div>
      }
    >
      {combate.finalizado && (
        <p className="mb-3">
          <strong>Ganador:</strong> {entidadGanadorNombre} ({combate.roundsGanadosGanador} - {combate.roundsGanadosPerdedor})
        </p>
      )}
      {combate.link && (
        <div className="mb-3">
          {embed ? (
            <div
              className="video-container mb-3"
              style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}
            >
              <iframe
                src={embed}
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
          <Column
            header="Ganador"
            body={(row) => {
              if (isIndividual) {
                return row.idUsuarioGanador === combate.idUsuarioA
                  ? `${row.nombreUsuarioA || ''} ${row.apellidoUsuarioA || ''}`.trim()
                  : `${row.nombreUsuarioB || ''} ${row.apellidoUsuarioB || ''}`.trim();
              }
              return row.nombreEquipoGanador || '-';
            }}
          />
          <Column
            header={entidadANombre}
            body={(row) => (isIndividual ? row.puntosEquipoA : row.puntosEquipoA)}
            style={{ width: '8rem' }}
          />
          <Column
            header={entidadBNombre}
            body={(row) => (isIndividual ? row.puntosEquipoB : row.puntosEquipoB)}
            style={{ width: '8rem' }}
          />
        </DataTable>
      ) : (
        <p className="m-0 text-color-secondary">Sin rounds registrados.</p>
      )}
    </AccordionTab>
  );
}