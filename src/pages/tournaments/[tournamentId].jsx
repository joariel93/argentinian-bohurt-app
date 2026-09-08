import React, { useState, useEffect } from 'react';
import { Skeleton } from 'primereact/skeleton';
import TournamentResult from '@/components/specifics/infoViews/TournamentResult';
import { useRouter } from 'next/router';
import apiService from '@/services/apiService';

const TournamentPage = () => {
  const [tournament, setTournament] = useState(null);
  const [combates, setCombates] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ equipos: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { tournamentId } = router.query;

  useEffect(() => {
    if (!router.isReady || !tournamentId) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const info = await apiService.fetchTournamentInfoSimplify(tournamentId);
        if (!info || !info.id) {
          router.replace('/tournaments');
          return;
        }
        const [combatesData, estadisticasData] = await Promise.all([
          apiService.fetchTournamentCombates(tournamentId),
          apiService.fetchTorneoEstadisticas(tournamentId),
        ]);
        setTournament(info);
        setCombates(combatesData.combates || []);
        setEstadisticas(estadisticasData || { equipos: [] });
      } catch {
        router.replace('/tournaments');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, tournamentId]);

  if (loading) {
    return (
      <div className="card">
        <div className="flex flex-column align-items-center mb-3">
          <Skeleton width="12rem" height="2.5rem" className="mb-2" />
          <Skeleton width="16rem" height="1.5rem" className="mb-2" />
          <Skeleton width="20rem" height="1.5rem" />
        </div>
        <Skeleton width="100%" height="5rem" className="mb-2" />
        <Skeleton width="100%" height="8rem" className="mb-2" />
        <Skeleton width="100%" height="10rem" />
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  return <TournamentResult tournament={tournament} combates={combates} estadisticas={estadisticas} />;
};

export default TournamentPage;
