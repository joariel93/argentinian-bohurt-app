import React, { useState, useEffect } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Fieldset } from 'primereact/fieldset';
import { Image } from 'primereact/image';
import { Skeleton } from 'primereact/skeleton';
import TeamGrid from '../../components/common/grids/TeamGrid.jsx';
import apiService from '@/services/apiService.js';
import { useRouter } from 'next/router';
import StaticsTable from '@/components/common/tables/StaticsTable.jsx';

function formatDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const ClubPage = () => {
  const [team, setTeam] = useState({});
  const [loading, setLoading] = useState(true);
  const [clubId, setClubId] = useState(null);
  const router = useRouter();
  const { nombre } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const raw = sessionStorage.getItem('clubNav');
    if (!raw) {
      router.replace('/clubs');
      return;
    }

    const clubNav = JSON.parse(raw);
    if (!clubNav.id) {
      sessionStorage.removeItem('clubNav');
      router.replace('/clubs');
      return;
    }

    setClubId(clubNav.id);

    const fetchTeam = async () => {
      setLoading(true);
      try {
        const data = await apiService.fetchClubData(clubNav.id);
        if (data && data.club) {
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
      sessionStorage.removeItem('clubNav');
    };
  }, []);

  return (
    <div className="card">
      {loading ? (
        <>
          <div className="flex flex-column align-items-center mb-3">
            <Skeleton shape="circle" size="6rem" className="mb-2" />
            <Skeleton width="12rem" height="2rem" className="mb-2" />
            <Skeleton width="20rem" height="1.5rem" />
          </div>
          <Fieldset legend="Información" toggleable>
            <Skeleton width="100%" height="2rem" className="mb-2" />
            <Skeleton width="90%" height="2rem" className="mb-2" />
            <Skeleton width="80%" height="2rem" />
          </Fieldset>
          <br />
          <Fieldset legend="Estadísticas" toggleable>
            <Skeleton width="100%" height="2rem" className="mb-2" />
            <Skeleton width="90%" height="2rem" className="mb-2" />
            <Skeleton width="80%" height="2rem" />
          </Fieldset>
        </>
      ) : (
        <>
          <div className="flex flex-column align-items-center mb-3">
            {team.logo && (
              <Image src={team.logo} alt={team.club} width="100" height="100" className="border-circle mb-2" />
            )}
            <h1 className="m-0">{team.club || nombre}</h1>
            <div className="flex align-items-center gap-3 mt-2">
              {team.foundation && (
                <span className="text-color-secondary">
                  <i className="pi pi-calendar mr-1" />{formatDate(team.foundation)}
                </span>
              )}
              {team.country && (
                <img alt={team.country} src="/flag_placeholder.png"
                  className={`flag flag-${team.country}`} style={{ width: '24px' }} />
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
            <StaticsTable idClub={clubId} />
            <p className="m-0 text-color-secondary">*Se consideran torneos desde 2026</p>
          </Fieldset>
          <br />

          {team.teams && team.teams.length > 0 && (
            <Accordion>
              <AccordionTab header="Equipos">
                <TeamGrid teams={team.teams} loading={false} />
              </AccordionTab>
            </Accordion>
          )}
        </>
      )}
    </div>
  );
};

export default ClubPage;
