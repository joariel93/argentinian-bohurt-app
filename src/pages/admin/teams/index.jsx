import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ProgressSpinner } from 'primereact/progressspinner';
import AdminRoute from '@/components/admin/AdminRoute';
import ImageUpload from '@/components/common/inputs/ImageUpload';
import SocialLinksInput from '@/components/common/inputs/SocialLinksInput';
import FormSubmitButton from '@/components/common/buttons/FormSubmitButton';
import TableSkeleton from '@/components/common/skeletons/TableSkeleton';
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
  redesSociales: [],
};

const AdminTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [team, setTeam] = useState(emptyTeam);
  const [isEditing, setIsEditing] = useState(false);
  const [redesSocialesOptions, setRedesSocialesOptions] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamsData, clubsData, generosData, modalidadesData, coloresData, redesData] = await Promise.all([
        apiService.fetchTeams(),
        apiService.fetchClubsSimplify(),
        apiService.fetchLookupGenero(),
        apiService.fetchLookupModalidad(),
        apiService.fetchLookupColores(),
        apiService.fetchLookupRedesSociales(),
      ]);
      setTeams(teamsData);
      setClubs(clubsData.map((c) => ({ label: c.nombre, value: c.id, logo: c.logo })));
      setGeneros(generosData.map((g) => ({ label: g.valor, value: g.id })));
      setModalidades(modalidadesData.map((m) => ({ label: m.valor, value: m.id })));
      setColores(coloresData.map((c) => ({ label: c.valor, value: c.id })));
      setRedesSocialesOptions(redesData);
    } catch (err) {
      showError(err.message || 'Error al cargar equipos');
    } finally {
      setLoading(false);
    }
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

  const openEdit = async (rowData) => {
    setIsEditing(true);
    setDialogVisible(true);
    setEditLoading(true);
    setTeam(emptyTeam);
    try {
      const data = await apiService.fetchTeam(rowData.id);
      if (data.error) {
        showError(data.error);
        setDialogVisible(false);
        return;
      }
      setTeam({
        id: data.id,
        nombre: data.nombre || '',
        logo: data.logo || '',
        idClub: data.clubId || null,
        idGenero: data.esMasculino ? 1 : 2,
        idModalidad: data.idModalidad || 1,
        idCategoria: data.idCategoria || 1,
        idColor1: data.color1 || 1,
        idColor2: data.color2 || 2,
        idColor3: data.color3 || 3,
        fechaCreacion: data.fechaCreacion || '',
        redesSociales: mapRedesToForm(data.redesSociales),
      });
      if (data.idModalidad) {
        await apiService.fetchLookupCategorias(data.idModalidad).then((cats) => {
          setCategorias(cats.map((c) => ({ label: c.valor, value: c.id })));
        });
      }
    } catch (err) {
      showError(err.message || 'Error al cargar el equipo');
      setDialogVisible(false);
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDelete = (rowData) => {
    setTeamToDelete(rowData);
    setDeleteDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setEditLoading(false);
  };
  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setTeamToDelete(null);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setTeam((prev) => ({ ...prev, [name]: val }));
  };

  const onDropdownChange = (e, name) => {
    setTeam((prev) => {
      const updated = { ...prev, [name]: e.value };
      if (name === 'idClub') {
        const selectedClub = clubs.find((c) => c.value === e.value);
        if (selectedClub?.logo) {
          updated.logo = selectedClub.logo;
        }
      }
      return updated;
    });
  };

  const mapRedesToForm = (redes = []) => {
    return redes
      .map((r) => {
        const option = redesSocialesOptions.find((o) => o.valor === r.platform);
        if (!option) return null;
        return { idRedSocial: option.id, link: r.url || '' };
      })
      .filter(Boolean);
  };

  const mapRedesToPayload = (redes = []) => {
    return redes
      .filter((r) => r.idRedSocial && r.link)
      .map((r) => ({ idRedSocial: r.idRedSocial, link: r.link }));
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

    setSubmitting(true);
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
      redesSociales: mapRedesToPayload(team.redesSociales),
    };

    let result;
    if (isEditing) {
      result = await apiService.updateTeam(team.id, payload);
    } else {
      result = await apiService.createTeam(payload);
    }

    setSubmitting(false);
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

    setDeleting(true);
    const result = await apiService.deleteTeam(teamToDelete.id);
    setDeleting(false);
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
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} disabled={submitting || editLoading} />
      <FormSubmitButton loading={submitting || editLoading} label="Guardar" onClick={saveTeam} disabled={editLoading} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} disabled={deleting} />
      <FormSubmitButton loading={deleting} label="Sí" icon="pi pi-check" className="p-button-danger" onClick={deleteTeam} />
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

        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <DataTable value={teams} paginator rows={10} responsiveLayout="scroll">
            <Column body={logoBodyTemplate} header="Logo" style={{ width: '80px' }} />
            <Column field="nombre" header="Nombre" sortable />
            <Column field="clubNombre" header="Club" sortable />
            <Column field="modalidad" header="Modalidad" sortable />
            <Column field="categoria" header="Categoría" sortable />
            <Column field="genero" header="Género" sortable />
            <Column body={actionBodyTemplate} header="Acciones" style={{ width: '120px' }} />
          </DataTable>
        )}

        <Dialog visible={dialogVisible} onHide={hideDialog} header={isEditing ? 'Editar Equipo' : 'Nuevo Equipo'} footer={dialogFooter} style={{ width: '500px' }} modal>
          {editLoading ? (
            <div className="flex justify-content-center align-items-center p-4">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            </div>
          ) : (
            <div className="flex flex-column gap-3">
              <div>
                <label className="block mb-2 font-medium">Nombre *</label>
                <InputText value={team.nombre} onChange={(e) => onInputChange(e, 'nombre')} className="w-full" disabled={submitting} />
              </div>
              <div>
                <label className="block mb-2 font-medium">Club *</label>
                <Dropdown value={team.idClub} options={clubs} onChange={(e) => onDropdownChange(e, 'idClub')} placeholder="Seleccione un club" className="w-full" disabled={submitting} />
              </div>
              <ImageUpload
                label="Logo"
                value={team.logo}
                onChange={(url) => setTeam((prev) => ({ ...prev, logo: url }))}
                disabled={submitting}
              />
              <div className="grid">
                <div className="col-6">
                  <label className="block mb-2 font-medium">Modalidad</label>
                  <Dropdown value={team.idModalidad} options={modalidades} onChange={(e) => onDropdownChange(e, 'idModalidad')} className="w-full" disabled={submitting} />
                </div>
                <div className="col-6">
                  <label className="block mb-2 font-medium">Género</label>
                  <Dropdown value={team.idGenero} options={generos} onChange={(e) => onDropdownChange(e, 'idGenero')} className="w-full" disabled={submitting} />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium">Categoría</label>
                <Dropdown value={team.idCategoria} options={categorias} onChange={(e) => onDropdownChange(e, 'idCategoria')} className="w-full" disabled={submitting} />
              </div>
              <div className="grid">
                <div className="col-4">
                  <label className="block mb-2 font-medium">Color 1</label>
                  <Dropdown value={team.idColor1} options={colores} onChange={(e) => onDropdownChange(e, 'idColor1')} className="w-full" disabled={submitting} />
                </div>
                <div className="col-4">
                  <label className="block mb-2 font-medium">Color 2</label>
                  <Dropdown value={team.idColor2} options={colores} onChange={(e) => onDropdownChange(e, 'idColor2')} className="w-full" disabled={submitting} />
                </div>
                <div className="col-4">
                  <label className="block mb-2 font-medium">Color 3</label>
                  <Dropdown value={team.idColor3} options={colores} onChange={(e) => onDropdownChange(e, 'idColor3')} className="w-full" disabled={submitting} />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium">Fecha de creación</label>
                <Calendar value={parseDate(team.fechaCreacion)} onChange={onDateChange} dateFormat="yy-mm-dd" className="w-full" inputClassName="w-full" showIcon disabled={submitting} />
              </div>
              <SocialLinksInput
                value={team.redesSociales}
                options={redesSocialesOptions}
                onChange={(redes) => !submitting && setTeam((prev) => ({ ...prev, redesSociales: redes }))}
              />
            </div>
          )}
        </Dialog>

        <Dialog visible={deleteDialogVisible} onHide={hideDeleteDialog} header="Confirmar eliminación" footer={deleteDialogFooter} modal style={{ width: '350px' }}>
          <p>¿Estás seguro de que querés eliminar el equipo <strong>{teamToDelete?.nombre}</strong>?</p>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default AdminTeamsPage;
