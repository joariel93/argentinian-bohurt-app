import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import apiService from '@/services/apiService';
import SeoHead from '@/components/common/SeoHead';

export default function EquipoEnTorneoPage() {
  const router = useRouter();
  const { tournamentId, teamId } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId || !teamId) return;
    apiService.fetchEquipoEnTorneo(tournamentId, teamId).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [tournamentId, teamId]);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center p-4">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
      </div>
    );
  }

  if (!data || !data.equipo) {
    return <div className="p-4">No se encontró el equipo o el torneo.</div>;
  }

  const { torneo, equipo, stats, peleadores } = data;
  const pageTitle = `${equipo.nombre} | ${torneo.nombre}`;
  const description = `Estadísticas del equipo ${equipo.nombre} en el torneo ${torneo.nombre} de Bohurt Argentina.`;

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={description}
        pathname={`/tournaments/${tournamentId}/teams/${teamId}`}
      />
      <div className="p-4">
        <Button label="Volver al torneo" icon="pi pi-arrow-left" className="p-button-text mb-3" onClick={() => router.push(`/tournaments/${torneo.id}`)} />

        <div className="flex align-items-center gap-3 mb-4">
          {equipo.logo && <img src={equipo.logo} alt={equipo.nombre} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />}
          <div>
            <h1 className="m-0">{equipo.nombre}</h1>
            <p className="m-0 text-color-secondary">
              {equipo.clubNombre && `Club: ${equipo.clubNombre}`}
              {equipo.modalidad && ` | ${equipo.modalidad}`}
              {equipo.categoria && ` | ${equipo.categoria}`}
              {equipo.genero && ` | ${equipo.genero}`}
            </p>
            <p className="m-0 text-color-secondary">Torneo: {torneo.nombre} ({torneo.fechaTorneo})</p>
          </div>
        </div>

        {stats && (
          <div className="grid mb-4">
            <div className="col-6 md:col-2"><strong>Posición:</strong> {stats.posicion || '-'}</div>
            <div className="col-6 md:col-2"><strong>Combates:</strong> {stats.combates}</div>
            <div className="col-6 md:col-2"><strong>Victorias:</strong> {stats.victorias}</div>
            <div className="col-6 md:col-2"><strong>Derrotas:</strong> {stats.derrotas}</div>
            <div className="col-6 md:col-2"><strong>Rounds ganados:</strong> {stats.roundsGanados}</div>
            <div className="col-6 md:col-2"><strong>Rounds perdidos:</strong> {stats.roundsPerdidos}</div>
          </div>
        )}

        <h2>Peleadores</h2>
        <DataTable value={peleadores} stripedRows size="small" emptyMessage="No hay peleadores inscriptos">
          <Column field="numeroPeleador" header="#" style={{ width: '4rem' }} />
          <Column field="apellido" header="Apellido" sortable />
          <Column field="nombre" header="Nombre" sortable />
          <Column
            header="Acción"
            body={(row) => (
              <Button
                label="Ver perfil"
                icon="pi pi-user"
                className="p-button-sm p-button-outlined"
                onClick={() => router.push(`/peleadores/${row.id}`)}
              />
            )}
          />
        </DataTable>
      </div>
    </>
  );
}
