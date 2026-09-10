import React, { useState, useEffect } from 'react';
import DetailSkeleton from '@/components/common/skeletons/DetailSkeleton';
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
    return <DetailSkeleton hasImage={false} lines={6} actionButtons={2} />;
  }

  if (!tournament) {
    return null;
  }

  return <TournamentResult tournament={tournament} combates={combates} estadisticas={estadisticas} />;
};

export default TournamentPage;
