import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
});

const apiService = {
  checkTournamentExists: async (organizerId) => {
    try {
      const response = await api.get(`/api/v1/tournaments/by-organizer/${organizerId}`);
      return response.data;
    } catch (error) {
      console.error('Error en checkTournamentExists:', error);
      return false;
    }
  },

  fetchClubs: async () => {
    try {
      const response = await api.get('/api/v1/clubs');
      return response.data;
    } catch (error) {
      console.error('Error en fetchClubs:', error);
      return [];
    }
  },

  fetchClubData: async (idClub) => {
    try {
      const response = await api.get(`/api/v1/club/${idClub}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchClubData:', error);
      return {};
    }
  },

  fetchClubStats: async (idClub) => {
    try {
      const response = await api.get(`/api/v1/clubStats/${idClub}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchClubStats:', error);
      return {};
    }
  },

  fetchClubsSimplify: async () => {
    try {
      const response = await api.get('/api/v1/get-clubs-simplify');
      return response.data;
    } catch (error) {
      console.error('Error en fetchClubsSimplify:', error);
      return [];
    }
  },

  fetchTeam: async (idTeam) => {
    try {
      const response = await api.get(`/api/v1/teams/${idTeam}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchTeam:', error);
      return {};
    }
  },

  fetchTeamsSimplify: async (idClub) => {
    try {
      const response = await api.get(`/api/v1/get-teams-simplify/${idClub}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchTeamsSimplify:', error);
      return [];
    }
  },

  fetchTeamTournamentStats: async (idTeam) => {
    try {
      const response = await api.get(`/api/v1/tournaments-team/${idTeam}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchTeamTournamentStats:', error);
      return {};
    }
  },

  fetchTiposCombate: async (idModalidad) => {
    try {
      const response = await api.get(`/api/v1/combat-types/${idModalidad}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchTiposCombate:', error);
      return [];
    }
  },

  fetchTournamentInfoSimplify: async (tournamentId) => {
    try {
      const response = await api.get(`/api/v1/tournaments/${tournamentId}/info`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchTournamentInfoSimplify:', error);
      return {};
    }
  },

  fetchTournamentCombates: async (idTorneo) => {
    try {
      const response = await api.get(`/api/v1/torneo/${idTorneo}/combates`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchTournamentCombates:', error);
      return [];
    }
  },

  fetchTorneoEstadisticas: async (idTorneo) => {
    try {
      const response = await api.get(`/api/v1/torneo/${idTorneo}/estadisticas`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchTorneoEstadisticas:', error);
      return {};
    }
  },

  validateOtp: async (organizerId, otp) => {
    try {
      const response = await api.post(`/api/v1/organizers/${organizerId}/validate-otp`, { otp });
      return response.data.isValid;
    } catch (error) {
      console.error('Error en validateOtp:', error);
      return false;
    }
  },

  submitTournament: async (organizerId, otp, tournamentData) => {
    try {
      const response = await api.post(`/api/v1/organizers/${organizerId}/tournaments`, { otp, tournamentData });
      return response.data;
    } catch (error) {
      console.error('Error en submitTournament:', error);
      return {};
    }
  },

  fetchNoticias: async () => {
    try {
      const response = await api.get('/api/v1/news');
      return response.data;
    } catch (error) {
      console.error('Error en fetchNoticias:', error);
      return [];
    }
  },

  fetchNoticiaById: async (id) => {
    try {
      const response = await api.get(`/api/v1/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchNoticiaById:', error);
      return {};
    }
  },

  fetchTournaments: async () => {
    try {
      const response = await api.get('/api/v1/tournaments');
      return response.data;
    } catch (error) {
      console.error('Error en fetchTournaments:', error);
      return [];
    }
  },

  fetchLookupGenero: async () => {
    try {
      const response = await api.get('/api/lookups/genero');
      return response.data;
    } catch (error) {
      console.error('Error en fetchLookupGenero:', error);
      return [];
    }
  },

  fetchLookupModalidad: async () => {
    try {
      const response = await api.get('/api/lookups/modalidad');
      return response.data;
    } catch (error) {
      console.error('Error en fetchLookupModalidad:', error);
      return [];
    }
  },

  fetchLookupReglamento: async () => {
    try {
      const response = await api.get('/api/lookups/reglamento');
      return response.data;
    } catch (error) {
      console.error('Error en fetchLookupReglamento:', error);
      return [];
    }
  },

  fetchLookupTipoTorneo: async () => {
    try {
      const response = await api.get('/api/lookups/tipo-torneo');
      return response.data;
    } catch (error) {
      console.error('Error en fetchLookupTipoTorneo:', error);
      return [];
    }
  },

  fetchLookupCategorias: async (idModalidad) => {
    try {
      const response = await api.get(`/api/lookups/categoria/${idModalidad}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchLookupCategorias:', error);
      return [];
    }
  },

  adminCreateTorneo: async (data) => {
    try {
      const response = await api.post('/api/v1/tournaments', data);
      return response.data;
    } catch (error) {
      console.error('Error en adminCreateTorneo:', error);
      return {};
    }
  },

  fetchTeamsByFilters: async (modalidad, categoria, genero) => {
    try {
      const response = await api.get(`/api/v1/teams/by-filters?modalidad=${modalidad}&categoria=${categoria}&genero=${genero}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchTeamsByFilters:', error);
      return [];
    }
  },

  adminCreateTeam: async (data) => {
    try {
      const response = await api.post('/api/v1/admin/teams', data);
      return response.data;
    } catch (error) {
      console.error('Error en adminCreateTeam:', error);
      return {};
    }
  },

  fetchTorneoEquipos: async (idTorneo) => {
    try {
      const response = await api.get(`/api/v1/torneo/${idTorneo}/equipos`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchTorneoEquipos:', error);
      return [];
    }
  },

  addEquipoToTorneo: async (idTorneo, idEquipo, posicion) => {
    try {
      const response = await api.post(`/api/v1/torneo/${idTorneo}/equipos`, { idEquipo, posicion });
      return response.data;
    } catch (error) {
      console.error('Error en addEquipoToTorneo:', error);
      return {};
    }
  },

  addCombatesYEquiposToTorneo: async (idTorneo, equipos, combates) => {
    try {
      const response = await api.post(`/api/v1/torneo/${idTorneo}/combates`, { combates, equipos });
      return response.data;
    } catch (error) {
      console.error('Error en addCombatesYEquiposToTorneo:', error);
      return {};
    }
  },

  removeEquipoFromTorneo: async (idTorneo, idEquipo) => {
    try {
      const response = await api.delete(`/api/v1/torneo/${idTorneo}/equipos/${idEquipo}`);
      return response.data;
    } catch (error) {
      console.error('Error en removeEquipoFromTorneo:', error);
      return {};
    }
  },
};

export default apiService;
