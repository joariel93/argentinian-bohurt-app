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

const emptyTournament = {
  id: null,
  nombre: '',
  localizacion: '',
  fechaTorneo: '',
  fechaCierreInscripcion: '',
  idReglamento: 1,
  idGenero: 1,
  idModalidad: 1,
  idCategoria: 1,
  idTipoTorneo: null,
  imagen: '',
  password: '',
};

const AdminTournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [reglamentos, setReglamentos] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tiposTorneo, setTiposTorneo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [tournament, setTournament] = useState(emptyTournament);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    setLoading(true);
    const [tournamentsData, reglamentosData, generosData, modalidadesData, tiposTorneoData] = await Promise.all([
      apiService.fetchTournaments(),
      apiService.fetchLookupReglamento(),
      apiService.fetchLookupGenero(),
      apiService.fetchLookupModalidad(),
      apiService.fetchLookupTipoTorneo(),
    ]);
    setTournaments(tournamentsData);
    setReglamentos(reglamentosData.map((r) => ({ label: r.valor, value: r.id })));
    setGeneros(generosData.map((g) => ({ label: g.valor, value: g.id })));
    setModalidades(modalidadesData.map((m) => ({ label: m.valor, value: m.id })));
    setTiposTorneo([{ label: 'Ninguno', value: null }, ...tiposTorneoData.map((t) => ({ label: t.valor, value: t.id }))]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tournament.idModalidad) {
      apiService.fetchTiposCombate(tournament.idModalidad).then((cats) => {
        setCategorias(cats.map((c) => ({ label: c.valor, value: c.id })));
      });
    }
  }, [tournament.idModalidad]);

  const openNew = () => {
    setTournament(emptyTournament);
    setIsEditing(false);
    setDialogVisible(true);
  };

  const openEdit = (rowData) => {
    setTournament({
      id: rowData.id,
      nombre: rowData.nombre || '',
      localizacion: rowData.localizacion || '',
      fechaTorneo: rowData.fechaTorneo || '',
      fechaCierreInscripcion: rowData.fechaCierreInscripcion || '',
      idReglamento: rowData.idReglamento || 1,
      idGenero: rowData.id_genero || 1,
      idModalidad: rowData.id_modalidad || 1,
      idCategoria: rowData.id_categoria || 1,
      idTipoTorneo: rowData.idTipoTorneo || null,
      imagen: rowData.imagen || '',
      password: rowData.password || '',
    });
    setIsEditing(true);
    setDialogVisible(true);
  };

  const confirmDelete = (rowData) => {
    setTournamentToDelete(rowData);
    setDeleteDialogVisible(true);
  };

  const hideDialog = () => setDialogVisible(false);
  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setTournamentToDelete(null);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setTournament((prev) => ({ ...prev, [name]: val }));
  };

  const onDropdownChange = (e, name) => {
    setTournament((prev) => ({ ...prev, [name]: e.value }));
  };

  const onDateChange = (e, name) => {
    const date = e.value;
    let formatted = '';
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formatted = `${year}-${month}-${day}`;
    }
    setTournament((prev) => ({ ...prev, [name]: formatted }));
  };

  const saveTournament = async () => {
    if (!tournament.nombre || !tournament.localizacion || !tournament.fechaTorneo || !tournament.fechaCierreInscripcion) {
      showError('Nombre, localización y fechas son requeridos');
      return;
    }

    const payload = {
      nombre: tournament.nombre,
      localizacion: tournament.localizacion,
      fechaTorneo: tournament.fechaTorneo,
      fechaCierreInscripcion: tournament.fechaCierreInscripcion,
      idReglamento: tournament.idReglamento,
      idGenero: tournament.idGenero,
      idCategoria: tournament.idCategoria,
      idModalidad: tournament.idModalidad,
      idTipoTorneo: tournament.idTipoTorneo,
      imagen: tournament.imagen || null,
      password: tournament.password || null,
    };

    let result;
    if (isEditing) {
      result = await apiService.updateTournament(tournament.id, payload);
    } else {
      result = await apiService.adminCreateTorneo(payload);
    }

    if (result.error) {
      showError(result.error);
      return;
    }

    showSuccess(isEditing ? 'Torneo actualizado' : 'Torneo creado');
    setDialogVisible(false);
    loadData();
  };

  const deleteTournament = async () => {
    if (!tournamentToDelete) return;
    const result = await apiService.deleteTournament(tournamentToDelete.id);
    if (result.error) {
      showError(result.error);
      return;
    }
    showSuccess('Torneo eliminado');
    setDeleteDialogVisible(false);
    setTournamentToDelete(null);
    loadData();
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-sm" onClick={() => openEdit(rowData)} />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDelete(rowData)} />
    </div>
  );

  const imageBodyTemplate = (rowData) => {
    if (!rowData.imagen) return <span className="text-color-secondary">Sin imagen</span>;
    return <img src={rowData.imagen} alt={rowData.nombre} style={{ width: '60px', height: '40px', objectFit: 'cover' }} />;
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-check" onClick={saveTournament} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
      <Button label="Sí" icon="pi pi-check" className="p-button-danger" onClick={deleteTournament} />
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
          <h1 className="text-3xl font-bold m-0">Gestión de Torneos</h1>
          <Button label="Nuevo Torneo" icon="pi pi-plus" onClick={openNew} />
        </div>

        <DataTable value={tournaments} loading={loading} paginator rows={10} responsiveLayout="scroll">
          <Column body={imageBodyTemplate} header="Imagen" style={{ width: '100px' }} />
          <Column field="nombre" header="Nombre" sortable />
          <Column field="localizacion" header="Localización" sortable />
          <Column field="fechaTorneo" header="Fecha" sortable />
          <Column field="estado" header="Estado" sortable />
          <Column body={actionBodyTemplate} header="Acciones" style={{ width: '120px' }} />
        </DataTable>

        <Dialog visible={dialogVisible} onHide={hideDialog} header={isEditing ? 'Editar Torneo' : 'Nuevo Torneo'} footer={dialogFooter} style={{ width: '600px' }} modal>
          <div className="flex flex-column gap-3">
            <div>
              <label className="block mb-2 font-medium">Nombre *</label>
              <InputText value={tournament.nombre} onChange={(e) => onInputChange(e, 'nombre')} className="w-full" />
            </div>
            <div>
              <label className="block mb-2 font-medium">Localización *</label>
              <InputText value={tournament.localizacion} onChange={(e) => onInputChange(e, 'localizacion')} className="w-full" />
            </div>
            <div className="grid">
              <div className="col-6">
                <label className="block mb-2 font-medium">Fecha del torneo *</label>
                <Calendar value={parseDate(tournament.fechaTorneo)} onChange={(e) => onDateChange(e, 'fechaTorneo')} dateFormat="yy-mm-dd" className="w-full" inputClassName="w-full" showIcon />
              </div>
              <div className="col-6">
                <label className="block mb-2 font-medium">Cierre de inscripción *</label>
                <Calendar value={parseDate(tournament.fechaCierreInscripcion)} onChange={(e) => onDateChange(e, 'fechaCierreInscripcion')} dateFormat="yy-mm-dd" className="w-full" inputClassName="w-full" showIcon />
              </div>
            </div>
            <div className="grid">
              <div className="col-6">
                <label className="block mb-2 font-medium">Modalidad</label>
                <Dropdown value={tournament.idModalidad} options={modalidades} onChange={(e) => onDropdownChange(e, 'idModalidad')} className="w-full" />
              </div>
              <div className="col-6">
                <label className="block mb-2 font-medium">Género</label>
                <Dropdown value={tournament.idGenero} options={generos} onChange={(e) => onDropdownChange(e, 'idGenero')} className="w-full" />
              </div>
            </div>
            <div className="grid">
              <div className="col-6">
                <label className="block mb-2 font-medium">Categoría</label>
                <Dropdown value={tournament.idCategoria} options={categorias} onChange={(e) => onDropdownChange(e, 'idCategoria')} className="w-full" />
              </div>
              <div className="col-6">
                <label className="block mb-2 font-medium">Tipo de torneo</label>
                <Dropdown value={tournament.idTipoTorneo} options={tiposTorneo} onChange={(e) => onDropdownChange(e, 'idTipoTorneo')} className="w-full" />
              </div>
            </div>
            <div className="grid">
              <div className="col-6">
                <label className="block mb-2 font-medium">Reglamento</label>
                <Dropdown value={tournament.idReglamento} options={reglamentos} onChange={(e) => onDropdownChange(e, 'idReglamento')} className="w-full" />
              </div>
              <div className="col-6">
                <label className="block mb-2 font-medium">Password / OTP</label>
                <InputText value={tournament.password} onChange={(e) => onInputChange(e, 'password')} className="w-full" />
              </div>
            </div>
            <ImageUpload
              label="Imagen"
              value={tournament.imagen}
              onChange={(url) => setTournament((prev) => ({ ...prev, imagen: url }))}
            />
          </div>
        </Dialog>

        <Dialog visible={deleteDialogVisible} onHide={hideDeleteDialog} header="Confirmar eliminación" footer={deleteDialogFooter} modal style={{ width: '350px' }}>
          <p>¿Estás seguro de que querés eliminar el torneo <strong>{tournamentToDelete?.nombre}</strong>?</p>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default AdminTournamentsPage;
