import { useState } from 'react';
import { DataView } from 'primereact/dataview';
import DuelistaCard from './DuelistaCard';

export default function DuelistasGrid({ duelistas }) {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12);

  if (!Array.isArray(duelistas) || duelistas.length === 0) {
    return (
      <p className="text-color-secondary text-sm m-0">
        No hay duelistas registrados para esta modalidad en este club.
      </p>
    );
  }

  const itemTemplate = (peleador) => <DuelistaCard peleador={peleador} />;

  return (
    <DataView
      value={duelistas}
      itemTemplate={itemTemplate}
      layout="grid"
      rows={rows}
      first={first}
      onPage={(e) => {
        setFirst(e.first);
        setRows(e.rows);
      }}
      paginator
      paginatorTemplate="PrevPageLink PageLinks NextPageLink"
      rowsPerPageOptions={[6, 12, 24, 48]}
      emptyMessage="No hay duelistas para mostrar"
    />
  );
}
