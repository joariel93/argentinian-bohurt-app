import React from 'react';
import { useRouter } from 'next/router';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Image } from 'primereact/image';

export default function PosicionesTable({ equipos }) {
  const router = useRouter();
  const { tournamentId } = router.query;

  if (!equipos || equipos.length === 0) {
    return <p className="m-0 text-color-secondary">Sin equipos.</p>;
  }

  const goToEquipo = (equipoId) => {
    if (tournamentId && equipoId) {
      router.push(`/tournaments/${tournamentId}/teams/${equipoId}`);
    }
  };

  const equipoBodyTemplate = (rowData) => (
    <div
      className="flex align-items-center gap-2 cursor-pointer"
      onClick={() => goToEquipo(rowData.id)}
      style={{ cursor: 'pointer' }}
    >
      {rowData.logo && (
        <Image src={rowData.logo} alt={rowData.nombre} width="28" height="28" className="border-circle" />
      )}
      <span className="font-semibold text-primary">{rowData.nombre}</span>
    </div>
  );

  return (
    <DataTable value={equipos} size="small" stripedRows>
      <Column
        header="#"
        body={(row, { rowIndex }) => row.posicion || rowIndex + 1}
        style={{ width: '3rem' }}
      />
      <Column header="Equipo" body={equipoBodyTemplate} />
      <Column field="combates" header="Combates" style={{ width: '6rem' }} />
      <Column field="victorias" header="Ganados" style={{ width: '6rem' }} />
      <Column field="derrotas" header="Perdidos" style={{ width: '6rem' }} />
      <Column field="roundsGanados" header="RG" style={{ width: '4rem' }} />
      <Column field="roundsPerdidos" header="RP" style={{ width: '4rem' }} />
    </DataTable>
  );
}
