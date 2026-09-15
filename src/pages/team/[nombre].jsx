import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Fieldset } from 'primereact/fieldset';
import { Image } from 'primereact/image';
import DetailSkeleton from '@/components/common/skeletons/DetailSkeleton';
import apiService from '@/services/apiService.js';
import { getModalidadIcon } from '@/utils/modalidadIcons';
import { useRouter } from 'next/router';
import DetailStaticsTable from '@/components/common/tables/DetailStaticsTable.jsx';

const TeamPage = () => {
  const [team, setTeam] = useState({});
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState(null);
  const router = useRouter();
  const { nombre } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const raw = sessionStorage.getItem('teamNav');
    if (!raw) {
      router.replace('/clubs');
      return;
    }

    const teamNav = JSON.parse(raw);
    if (!teamNav.id) {
      sessionStorage.removeItem('teamNav');
      router.replace('/clubs');
      return;
    }

    setTeamId(teamNav.id);

    const fetchTeam = async () => {
      setLoading(true);
      try {
        const data = await apiService.fetchTeam(teamNav.id);
        if (data && data.nombre) {
          setTeam(data);
        } else {
          router.replace('/clubs');
        }
      } catch {
        router.replace('/clubs');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [router.isReady]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('teamNav');
    };
  }, []);

  return (
    <div className="card">
      {loading ? (
        <DetailSkeleton hasImage lines={4} actionButtons={3} />
      ) : (
        <>
          <div className="flex flex-column align-items-center mb-3">
            {team.club && (
              <Button
                icon="pi pi-arrow-left"
                label={`Volver a ${team.club}`}
                className="p-button-text mb-2"
                onClick={() => {
                  sessionStorage.setItem('clubNav', JSON.stringify({ id: team.clubId, nombre: team.club }));
                  router.push(`/clubs/${encodeURIComponent(team.club)}`);
                }}
              />
            )}
            {team.logo && (
              <Image src={team.logo} alt={team.nombre} width="100" height="100" className="border-circle mb-2" />
            )}
            <h1 className="m-0">{team.nombre || nombre}</h1>
            <div className="flex align-items-center gap-3 mt-2">
              {team.idModalidad && (
                <div
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0.25rem',
                    background: team.esMasculino ? '#2196F3' : '#EC407A',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  <img
                    src={getModalidadIcon(team.idModalidad).src}
                    alt={team.modalidad}
                    title={team.modalidad}
                    style={{ width: '1.75rem', height: '1.75rem' }}
                  />
                </div>
              )}
              {team.club && (
                <span className="text-color-secondary">
                  <i className="pi pi-users mr-1" />{team.club}
                </span>
              )}
              {team.redesSociales && team.redesSociales.length > 0 && (
                <>
                  <div className="social-icons">
                    {team.redesSociales.map((redSocial) => (
                      <Button
                        key={redSocial.platform}
                        icon={redSocial.iconClass}
                        className="p-button-outlined mx-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(redSocial.url, '_blank');
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <Fieldset legend="Información" toggleable>
            <p className="m-0">{team.info || 'Sin información disponible.'}</p>
          </Fieldset>
          <br />

          <Fieldset legend="Estadísticas" toggleable>
            <DetailStaticsTable idTeam={teamId} />
            <p className="m-0 text-color-secondary">*Se consideran torneos desde 2023</p>
          </Fieldset>
          <br />

          <Fieldset legend="Peleadores" toggleable>
            <DataTable value={team.peleadores || []} stripedRows size="small" emptyMessage="No hay peleadores registrados">
              <Column field="apellido" header="Apellido" sortable />
              <Column field="nombre" header="Nombre" sortable />
              <Column field="dni" header="DNI" />
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
          </Fieldset>
        </>
      )}
    </div>
  );
};

export default TeamPage;
