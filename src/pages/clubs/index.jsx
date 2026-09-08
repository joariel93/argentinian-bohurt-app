import React, { useState, useEffect } from 'react';
import TeamGrid from '../../components/common/grids/TeamGrid.jsx';  // Asegúrate de que la ruta sea correcta
import apiService from '@/services/apiService.js'; // Asegúrate de que la ruta sea correcta

const ClubsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchTeams = async () => {
      // Simula una demora de 2 segundos antes de devolver los datos
      const data = await new Promise((resolve) =>
        resolve(apiService.fetchClubs())
      );
      setTeams(data.slice(0, 12));
      setLoading(false);
    };

    fetchTeams();
  }, []);

  const header = () => {
    return (
      <div className="flex justify-content-center">
        <h1>Clubes</h1>
      </div>
    );
  };

  return (
    <div className="card">
      {header()}
      <TeamGrid teams={teams} loading={loading} />
    </div>
  );
};

export default ClubsPage;