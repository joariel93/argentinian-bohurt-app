import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

export default function PosicionesTable({ items, modalidad }) {
  if (!items || items.length === 0) {
    return <p className="m-0 text-color-secondary">Sin posiciones.</p>;
  }

  const isIndividual = [2, 3].includes(modalidad);

  if (isIndividual) {
    return (
      <DataTable value={items} size="small" stripedRows>
        <Column
          header="#"
          body={(row, { rowIndex }) => row.posicion || rowIndex + 1}
          style={{ width: '3rem' }}
        />
        <Column
          header="Peleador"
          body={(row) => `${row.apellido}, ${row.nombre}`}
        />
        <Column field="combates" header="Combates" style={{ width: '6rem' }} />
        <Column field="victorias" header="Ganados" style={{ width: '6rem' }} />
        <Column field="derrotas" header="Perdidos" style={{ width: '6rem' }} />
        <Column field="puntos" header="Puntos" style={{ width: '6rem' }} />
      </DataTable>
    );
  }

  return (
    <DataTable value={items} size="small" stripedRows>
      <Column
        header="#"
        body={(row, { rowIndex }) => row.posicion || rowIndex + 1}
        style={{ width: '3rem' }}
      />
      <Column header="Equipo" body={(row) => row.nombre || row.id} />
      <Column field="combates" header="Combates" style={{ width: '6rem' }} />
      <Column field="victorias" header="Ganados" style={{ width: '6rem' }} />
      <Column field="derrotas" header="Perdidos" style={{ width: '6rem' }} />
      <Column field="roundsGanados" header="RG" style={{ width: '4rem' }} />
      <Column field="roundsPerdidos" header="RP" style={{ width: '4rem' }} />
    </DataTable>
  );
}