import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import AdminRoute from '@/components/admin/AdminRoute';
import ImageUpload from '@/components/common/inputs/ImageUpload';
import apiService from '@/services/apiService.js';
import { useToast } from '@/contexts/ToastContext';

const emptyTeam = {
  id: null,
  nombre: '',
  logo: '',
  idClub: null,
  idGenero: 1,
  idModalidad: 1,
  idCategoria: 1,
  idColor1: 1,
  idColor2: 2,
  idColor3: 3,
  fechaCreacion: '',
};

const AdminTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [team, setTeam] = useState(emptyTeam);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    setLoading(true);
    const [teamsData, clubsData, generosData, modalidadesData, coloresData] = await Promise.all([
      apiService.fetchTeams(),
      apiService.fetchClubsSimplify(),
      apiService.fetchLookupGenero(),
      apiService.fetchLookupModalidad(),
      apiService.fetchLookupColores(),
    ]);
    setTeams(teamsData);
    setClubs(clubsData.map((c) => ({ label: c.nombre, value: c.id })));
    setGeneros(generosData.map((g) => ({ label: g.valor, value: g.id })));
    setModalidades(modalidadesData.map((m) => ({ label: m.valor, value: m.id })));
    setColores(coloresData.map((c) => ({ label: c.valor, value: c.id })));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (team.idModalidad) {
      apiService.fetchLookupCategorias(team.idModalidad).then((cats) => {
        setCategorias(cats.map((c) => ({ label: c.valor, value: c.id })));
      });
    }
  }, [team.idModalidad]);

  const openNew = () => {
    setTeam(emptyTeam);
    setIsEditing(false);
    setDialogVisible(true);
  };

  const openEdit = (rowData) => {
    setTeam({
      id: rowData.id,
      nombre: rowData.nombre || '',
      logo: rowData.logo || '',
      idClub: rowData.clubId || null,
      idGenero: rowData.id_genero || 1,
      idModalidad: rowData.id_modalidad || 1,
      idCategoria: rowData.id_categoria || 1,
      idColor1: rowData.id_color1 || 1,
      idColor2: rowData.id_color2 || 2,
      idColor3: rowData.id_color3 || 3,
      fechaCreacion: rowData.fechaCreacion || '',
    });
    setIsEditing(true);
    setDialogVisible(true);
  };

  const confirmDelete = (rowData) => {
    setTeamToDelete(rowData);
    setDeleteDialogVisible(true);
  };

  const hideDialog = () => setDialogVisible(false);
  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setTeamToDelete(null);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setTeam((prev) => ({ ...prev, [name]: val }));
  };

  const onDropdownChange = (e, name) => {
    setTeam((prev) => ({ ...prev, [name]: e.value }));
  };

  const onDateChange = (e) => {
    const date = e.value;
    let formatted = '';
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formatted = `${year}-${month}-${day}`;
    }
    setTeam((prev) => ({ ...prev, fechaCreacion: formatted }));
  };

  const saveTeam = async () => {
    if (!team.nombre || !team.idClub) {
      showError('Nombre y club son requeridos');
      return;
    }

    const payload = {
      nombre: team.nombre,
      logo: team.logo || null,
      idClub: team.idClub,
      idGenero: team.idGenero,
      idModalidad: team.idModalidad,
      idCategoria: team.idCategoria,
      idColor1: team.idColor1,
      idColor2: team.idColor2,
      idColor3: team.idColor3,
      fechaCreacion: team.fechaCreacion || null,
    };

    let result;
    if (isEditing) {
      result = await apiService.updateTeam(team.id, payload);
    } else {
      result = await apiService.createTeam(payload);
    }

    if (result.error) {
      showError(result.error);
      return;
    }

    showSuccess(isEditing ? 'Equipo actualizado' : 'Equipo creado');
    setDialogVisible(false);
    loadData();
  };

  const deleteTeam = async () => {
    if (!teamToDelete) return;
    const result = await apiService.deleteTeam(teamToDelete.id);
    if (result.error) {
      showError(result.error);
      return;
    }
    showSuccess('Equipo eliminado');
    setDeleteDialogVisible(false);
    setTeamToDelete(null);
    loadData();
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-sm" onClick={() => openEdit(rowData)} />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDelete(rowData)} />
    </div>
  );

  const logoBodyTemplate = (rowData) => {
    if (!rowData.logo) return <span className="text-color-secondary">Sin logo</span>;
    return <img src={rowData.logo} alt={rowData.nombre} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />;
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-check" onClick={saveTeam} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
      <Button label="Sí" icon="pi pi-check" className="p-button-danger" onClick={deleteTeam} />
    </div>
  );

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <AdminRoute>
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="text-3xl font-bold m-0">Gestión de Equipos</h1>
          <Button label="Nuevo Equipo" icon="pi pi-plus" onClick={openNew} />
        </div>

        <DataTable value={teams} loading={loading} paginator rows={10} responsiveLayout="scroll">
          <Column body={logoBodyTemplate} header="Logo" style={{ width: '80px' }} />
          <Column field="nombre" header="Nombre" sortable />
          <Column field="clubNombre" header="Club" sortable />
          <Column field="modalidad" header="Modalidad" sortable />
          <Column field="categoria" header="Categoría" sortable />
          <Column field="genero" header="Género" sortable />
          <Column body={actionBodyTemplate} header="Acciones" style={{ width: '120px' }} />
        </DataTable>

        <Dialog visible={dialogVisible} onHide={hideDialog} header={isEditing ? 'Editar Equipo' : 'Nuevo Equipo'} footer={dialogFooter} style={{ width: '500px' }} modal>
          <div className="flex flex-column gap-3">
            <div>
              <label className="block mb-2 font-medium">Nombre *</label>
              <InputText value={team.nombre} onChange={(e) => onInputChange(e, 'nombre')} className="w-full" />
            </div>
            <div>
              <label className="block mb-2 font-medium">Club *</label>
              <Dropdown value={team.idClub} options={clubs} onChange={(e) => onDropdownChange(e, 'idClub')} placeholder="Seleccione un club" className="w-full" />
            </div>
            <ImageUpload
              label="Logo"
              value={team.logo}
              onChange={(url) => setTeam((prev) => ({ ...prev, logo: url }))}
            />
            <div className="grid">
              <div className="col-6">
                <label className="block mb-2 font-medium">Modalidad</label>
                <Dropdown value={team.idModalidad} options={modalidades} onChange={(e) => onDropdownChange(e, 'idModalidad')} className="w-full" />
              </div>
              <div className="col-6">
                <label className="block mb-2 font-medium">Género</label>
                <Dropdown value={team.idGenero} options={generos} onChange={(e) => onDropdownChange(e, 'idGenero')} className="w-full" />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Categoría</label>
              <Dropdown value={team.idCategoria} options={categorias} onChange={(e) => onDropdownChange(e, 'idCategoria')} className="w-full" />
            </div>
            <div className="grid">
              <div className="col-4">
                <label className="block mb-2 font-medium">Color 1</label>
                <Dropdown value={team.idColor1} options={colores} onChange={(e) => onDropdownChange(e, 'idColor1')} className="w-full" />
              </div>
              <div className="col-4">
                <label className="block mb-2 font-medium">Color 2</label>
                <Dropdown value={team.idColor2} options={colores} onChange={(e) => onDropdownChange(e, 'idColor2')} className="w-full" />
              </div>
              <div className="col-4">
                <label className="block mb-2 font-medium">Color 3</label>
                <Dropdown value={team.idColor3} options={colores} onChange={(e) => onDropdownChange(e, 'idColor3')} className="w-full" />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Fecha de creación</label>
              <Calendar value={parseDate(team.fechaCreacion)} onChange={onDateChange} dateFormat="yy-mm-dd" className="w-full" inputClassName="w-full" showIcon />
            </div>
          </div>
        </Dialog>

        <Dialog visible={deleteDialogVisible} onHide={hideDeleteDialog} header="Confirmar eliminación" footer={deleteDialogFooter} modal style={{ width: '350px' }}>
          <p>¿Estás seguro de que querés eliminar el equipo <strong>{teamToDelete?.nombre}</strong>?</p>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default AdminTeamsPage;
