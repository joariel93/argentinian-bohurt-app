import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import apiService from '@/services/apiService';
import SeoHead from '@/components/common/SeoHead';
import { Fieldset } from 'primereact/fieldset';

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

  const { nombre, apellido, luchador, torneosBohurt, equipos, estadisticasBohurt } = data;
  const fullName = `${nombre} ${apellido}`;
  const description = `Perfil de ${fullName}, peleador de Bohurt Argentina. Estadísticas, torneos y equipos.`;
  const dataDuelos = data.torneosDuelo;
  const dataProfight = data.torneosProfight;
  const heraldico = dataDuelos ? dataDuelos.filter((t) => t.categoria === 1) : [];
  const broquel = dataDuelos ? dataDuelos.filter((t) => t.categoria === 2) : [];
  const espadaLarga = dataDuelos ? dataDuelos.filter((t) => t.categoria === 3) : [];
  const astas = dataDuelos ? dataDuelos.filter((t) => t.categoria === 4) : [];

  return (
    <>
      <SeoHead
        title={fullName}
        description={description}
        pathname={`/peleadores/${id}`}
      />
      <div className="p-4">
        <Button label="Volver" icon="pi pi-arrow-left" className="p-button-text mb-3" onClick={() => router.back()} />

        <div className="mb-4">
          <h1 className="m-0">{fullName}</h1>
          {luchador?.fechaNacimiento && (
            <p className="m-0 text-color-secondary">Fecha de nacimiento: {luchador.fechaNacimiento}</p>
          )}
        </div>
        {torneosBohurt.length > 0 && (
          <Fieldset legend="Bohurt" toggleable="true" collapsed="true" aria-expanded="true">
            <h2>Torneos</h2>
            <DataTable value={torneosBohurt} stripedRows size="small" emptyMessage="No hay torneos registrados">
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
            <DataTable value={estadisticasBohurt} stripedRows size="small" emptyMessage="No hay estadísticas">
              <Column field="torneoNombre" header="Torneo" />
              <Column field="combates" header="Combates" />
              <Column field="victorias" header="Victorias" />
              <Column field="derrotas" header="Derrotas" />
              <Column field="roundsGanados" header="RG" />
              <Column field="roundsPerdidos" header="RP" />
            </DataTable>
          </Fieldset >
        )}
        {dataDuelos.length > 0 && (
          <Fieldset legend="Duelos" toggleable="true" collapsed="true">
            {heraldico.length > 0 && (
              <Fieldset legend="Heraldico" toggleable="true" collapsed="true">
                <h2>Torneos</h2>
                <DataTable value={heraldico} stripedRows size="small" emptyMessage="No hay torneos registrados">
                  <Column field="nombre" header="Torneo" sortable />
                  <Column field="fechaTorneo" header="Fecha" sortable />
                  <Column field="posicion" header="Posición" sortable />
                  <Column field="cantidadCombates" header="Combates" />
                  <Column field="victorias" header="Victorias" />
                  <Column field="derrotas" header="Derrotas" />
                  <Column field="puntos" header="Puntos" />
                </DataTable>
              </Fieldset>
            )}
            {broquel.length > 0 && (
              <Fieldset legend="Broquel" toggleable="true" collapsed="true">
                <h2>Torneos</h2>
                <DataTable value={broquel} stripedRows size="small" emptyMessage="No hay torneos registrados">
                  <Column field="nombre" header="Torneo" sortable />
                  <Column field="fechaTorneo" header="Fecha" sortable />
                  <Column field="posicion" header="Posición" sortable />
                  <Column field="cantidadCombates" header="Combates" />
                  <Column field="victorias" header="Victorias" />
                  <Column field="derrotas" header="Derrotas" />
                  <Column field="puntos" header="Puntos" />
                </DataTable>
              </Fieldset>
            )}
            {espadaLarga.length > 0 && (
              <Fieldset legend="Espada Larga" toggleable="true" collapsed="true">
                <h2>Torneos</h2>
                <DataTable value={espadaLarga} stripedRows size="small" emptyMessage="No hay torneos registrados">
                  <Column field="nombre" header="Torneo" sortable />
                  <Column field="fechaTorneo" header="Fecha" sortable />
                  <Column field="posicion" header="Posición" sortable />
                  <Column field="cantidadCombates" header="Combates" />
                  <Column field="victorias" header="Victorias" />
                  <Column field="derrotas" header="Derrotas" />
                  <Column field="puntos" header="Puntos" />
                </DataTable>
              </Fieldset>
            )}
            {astas.length > 0 && (
              <Fieldset legend="Astas" toggleable="true" collapsed="true">
                <h2>Torneos</h2>
                <DataTable value={astas} stripedRows size="small" emptyMessage="No hay torneos registrados">
                  <Column field="nombre" header="Torneo" sortable />
                  <Column field="fechaTorneo" header="Fecha" sortable />
                  <Column field="posicion" header="Posición" sortable />
                  <Column field="cantidadCombates" header="Combates" />
                  <Column field="victorias" header="Victorias" />
                  <Column field="derrotas" header="Derrotas" />
                  <Column field="puntos" header="Puntos" />
                </DataTable>
              </Fieldset>
            )}
          </Fieldset>
        )}
        {dataProfight.length > 0 && (
          <Fieldset legend="Profight" toggleable="true" collapsed="true">
            <h2>Torneos</h2>
            <DataTable value={dataProfight} stripedRows size="small" emptyMessage="No hay torneos registrados">
              <Column field="nombre" header="Torneo" sortable />
              <Column field="fechaTorneo" header="Fecha" sortable />
              <Column field="posicion" header="Posición" sortable />
              <Column field="cantidadCombates" header="Combates" />
              <Column field="victorias" header="Victorias" />
              <Column field="derrotas" header="Derrotas" />
              <Column field="puntos" header="Puntos" />
            </DataTable>
          </Fieldset>
        )}
      </div>
    </>
  );
}
