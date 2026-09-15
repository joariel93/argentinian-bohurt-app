import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import apiService from '@/services/apiService';

export default function PeleadorPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiService.fetchPeleador(id).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center p-4">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
      </div>
    );
  }

  if (!data || !data.id) {
    return <div className="p-4">No se encontró el peleador.</div>;
  }

  const { nombre, apellido, dni, email, telefono, luchador, torneos, equipos, estadisticas } = data;

  return (
    <div className="p-4">
      <Button label="Volver" icon="pi pi-arrow-left" className="p-button-text mb-3" onClick={() => router.back()} />

      <div className="mb-4">
        <h1 className="m-0">{nombre} {apellido}</h1>
        <p className="m-0 text-color-secondary">
          DNI: {dni}
          {email && ` | Email: ${email}`}
          {telefono && ` | Tel: ${telefono}`}
        </p>
        {luchador?.fechaNacimiento && (
          <p className="m-0 text-color-secondary">Fecha de nacimiento: {luchador.fechaNacimiento}</p>
        )}
      </div>

      <h2>Torneos</h2>
      <DataTable value={torneos} stripedRows size="small" emptyMessage="No hay torneos registrados">
        <Column field="numeroPeleador" header="#" style={{ width: '4rem' }} />
        <Column field="nombre" header="Torneo" sortable />
        <Column field="fechaTorneo" header="Fecha" sortable />
        <Column
          header="Equipo"
          body={(row) => (
            <span
              className="text-primary cursor-pointer"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/tournaments/${row.id}/teams/${row.equipo.id}`)}
            >
              {row.equipo.nombre}
            </span>
          )}
        />
      </DataTable>

      <h2 className="mt-4">Equipos</h2>
      <DataTable value={equipos} stripedRows size="small" emptyMessage="No hay equipos registrados">
        <Column field="nombre" header="Equipo" sortable />
        <Column field="clubNombre" header="Club" sortable />
      </DataTable>

      <h2 className="mt-4">Estadísticas por torneo</h2>
      <DataTable value={estadisticas} stripedRows size="small" emptyMessage="No hay estadísticas">
        <Column field="torneoNombre" header="Torneo" />
        <Column field="combates" header="Combates" />
        <Column field="victorias" header="Victorias" />
        <Column field="derrotas" header="Derrotas" />
        <Column field="roundsGanados" header="RG" />
        <Column field="roundsPerdidos" header="RP" />
      </DataTable>
    </div>
  );
}
