import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  withCredentials: true,
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

  // Auth
  login: async (email, password) => {
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      return error.response?.data || { error: 'Error al iniciar sesión' };
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/api/v1/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Error en logout:', error);
      return { error: 'Error al cerrar sesión' };
    }
  },

  me: async () => {
    try {
      const response = await api.get('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error en me:', error);
      return null;
    }
  },

  // Users
  fetchUsers: async () => {
    try {
      const response = await api.get('/api/v1/users');
      return response.data;
    } catch (error) {
      console.error('Error en fetchUsers:', error);
      return [];
    }
  },

  fetchUser: async (id) => {
    try {
      const response = await api.get(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en fetchUser:', error);
      return null;
    }
  },

  createUser: async (data) => {
    try {
      const response = await api.post('/api/v1/users', data);
      return response.data;
    } catch (error) {
      console.error('Error en createUser:', error);
      return error.response?.data || { error: 'Error al crear usuario' };
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/api/v1/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error en updateUser:', error);
      return error.response?.data || { error: 'Error al actualizar usuario' };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteUser:', error);
      return error.response?.data || { error: 'Error al eliminar usuario' };
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

  createClub: async (data) => {
    try {
      const response = await api.post('/api/v1/clubs', data);
      return response.data;
    } catch (error) {
      console.error('Error en createClub:', error);
      return error.response?.data || { error: 'Error al crear club' };
    }
  },

  updateClub: async (id, data) => {
    try {
      const response = await api.put(`/api/v1/club/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error en updateClub:', error);
      return error.response?.data || { error: 'Error al actualizar club' };
    }
  },

  deleteClub: async (id) => {
    try {
      const response = await api.delete(`/api/v1/club/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteClub:', error);
      return error.response?.data || { error: 'Error al eliminar club' };
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

  fetchTeams: async () => {
    try {
      const response = await api.get('/api/v1/teams');
      return response.data;
    } catch (error) {
      console.error('Error en fetchTeams:', error);
      return [];
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

  updateCombateLink: async (idTorneo, idCombate, link) => {
    try {
      const response = await api.put(`/api/v1/torneo/${idTorneo}/combate/${idCombate}/link`, { link });
      return response.data;
    } catch (error) {
      console.error('Error en updateCombateLink:', error);
      return { error: error?.response?.data?.error || error.message };
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

  createNoticia: async (data) => {
    try {
      const response = await api.post('/api/v1/news', data);
      return response.data;
    } catch (error) {
      console.error('Error en createNoticia:', error);
      return error.response?.data || { error: 'Error al crear noticia' };
    }
  },

  updateNoticia: async (id, data) => {
    try {
      const response = await api.put(`/api/v1/news/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error en updateNoticia:', error);
      return error.response?.data || { error: 'Error al actualizar noticia' };
    }
  },

  deleteNoticia: async (id) => {
    try {
      const response = await api.delete(`/api/v1/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteNoticia:', error);
      return error.response?.data || { error: 'Error al eliminar noticia' };
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

  updateTournament: async (id, data) => {
    try {
      const response = await api.put(`/api/v1/tournaments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error en updateTournament:', error);
      return error.response?.data || { error: 'Error al actualizar torneo' };
    }
  },

  deleteTournament: async (id) => {
    try {
      const response = await api.delete(`/api/v1/tournaments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteTournament:', error);
      return error.response?.data || { error: 'Error al eliminar torneo' };
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

  fetchLookupColores: async () => {
    try {
      const response = await api.get('/api/lookups/colores');
      return response.data;
    } catch (error) {
      console.error('Error en fetchLookupColores:', error);
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

  fetchLookupTipoUsuario: async () => {
    try {
      const response = await api.get('/api/lookups/tipo-usuario');
      return response.data;
    } catch (error) {
      console.error('Error en fetchLookupTipoUsuario:', error);
      return [];
    }
  },

  fetchLookupRedesSociales: async () => {
    try {
      const response = await api.get('/api/lookups/redes-sociales');
      return response.data;
    } catch (error) {
      console.error('Error en fetchLookupRedesSociales:', error);
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
      return error.response?.data || { error: 'Error al crear torneo' };
    }
  },

  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/api/v1/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      return error.response?.data || { error: 'Error al subir imagen' };
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

  createTeam: async (data) => {
    try {
      const response = await api.post('/api/v1/teams', data);
      return response.data;
    } catch (error) {
      console.error('Error en createTeam:', error);
      return error.response?.data || { error: 'Error al crear equipo' };
    }
  },

  updateTeam: async (id, data) => {
    try {
      const response = await api.put(`/api/v1/teams/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error en updateTeam:', error);
      return error.response?.data || { error: 'Error al actualizar equipo' };
    }
  },

  deleteTeam: async (id) => {
    try {
      const response = await api.delete(`/api/v1/teams/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteTeam:', error);
      return error.response?.data || { error: 'Error al eliminar equipo' };
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
