import React, { useState, useEffect } from 'react';
import TeamGrid from '../../components/common/grids/TeamGrid.jsx';
import apiService from '@/services/apiService.js';
import SeoHead from '@/components/common/SeoHead';

const ClubsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchTeams = async () => {
      const data = await new Promise((resolve) =>
        resolve(apiService.fetchClubs())
      );
      setTeams(data);
      setLoading(false);
    };

    fetchTeams();
  }, []);

  return (
    <>
      <SeoHead
        title="Clubes"
        description="Conocé los clubes de Bohurt y combate medieval histórico de Argentina. Encontrá el tuyo y unite a la comunidad."
        pathname="/clubs"
      />
      <div className="card">
        <div className="flex justify-content-center mb-4">
          <h1>Clubes</h1>
        </div>
        <TeamGrid teams={teams} loading={loading} />
      </div>
    </>
  );
};

export default ClubsPage;