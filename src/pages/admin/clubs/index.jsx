import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import AdminRoute from '@/components/admin/AdminRoute';
import ImageUpload from '@/components/common/inputs/ImageUpload';
import apiService from '@/services/apiService.js';
import { useToast } from '@/contexts/ToastContext';

const emptyClub = {
  id: null,
  nombre: '',
  pais: '',
  logo: '',
  fundacion: '',
  info: '',
};

const AdminClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [club, setClub] = useState(emptyClub);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [clubToDelete, setClubToDelete] = useState(null);
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const loadClubs = async () => {
    setLoading(true);
    const data = await apiService.fetchClubs();
    setClubs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const openNew = () => {
    setClub(emptyClub);
    setIsEditing(false);
    setDialogVisible(true);
  };

  const openEdit = (rowData) => {
    setClub({ ...rowData });
    setIsEditing(true);
    setDialogVisible(true);
  };

  const confirmDelete = (rowData) => {
    setClubToDelete(rowData);
    setDeleteDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setClubToDelete(null);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setClub((prev) => ({ ...prev, [name]: val }));
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
    setClub((prev) => ({ ...prev, fundacion: formatted }));
  };

  const saveClub = async () => {
    if (!club.nombre || !club.fundacion) {
      showError('Nombre y fundación son requeridos');
      return;
    }

    const payload = {
      nombre: club.nombre,
      pais: club.pais || null,
      logo: club.logo || null,
      fundacion: club.fundacion,
      info: club.info || null,
    };

    let result;
    if (isEditing) {
      result = await apiService.updateClub(club.id, payload);
    } else {
      result = await apiService.createClub(payload);
    }

    if (result.error) {
      showError(result.error);
      return;
    }

    showSuccess(isEditing ? 'Club actualizado' : 'Club creado');
    setDialogVisible(false);
    loadClubs();
  };

  const deleteClub = async () => {
    if (!clubToDelete) return;

    const result = await apiService.deleteClub(clubToDelete.id);
    if (result.error) {
      showError(result.error);
      return;
    }

    showSuccess('Club eliminado');
    setDeleteDialogVisible(false);
    setClubToDelete(null);
    loadClubs();
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => openEdit(rowData)}
          tooltip="Editar"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip="Eliminar"
        />
      </div>
    );
  };

  const logoBodyTemplate = (rowData) => {
    if (!rowData.logo) return <span className="text-color-secondary">Sin logo</span>;
    return <img src={rowData.logo} alt={rowData.nombre} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />;
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-check" onClick={saveClub} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
      <Button label="Sí" icon="pi pi-check" className="p-button-danger" onClick={deleteClub} />
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
          <h1 className="text-3xl font-bold m-0">Gestión de Clubes</h1>
          <Button label="Nuevo Club" icon="pi pi-plus" onClick={openNew} />
        </div>

        <DataTable value={clubs} loading={loading} paginator rows={10} responsiveLayout="scroll">
          <Column body={logoBodyTemplate} header="Logo" style={{ width: '80px' }} />
          <Column field="nombre" header="Nombre" sortable />
          <Column field="country" header="País" sortable />
          <Column body={actionBodyTemplate} header="Acciones" style={{ width: '120px' }} />
        </DataTable>

        <Dialog
          visible={dialogVisible}
          onHide={hideDialog}
          header={isEditing ? 'Editar Club' : 'Nuevo Club'}
          footer={dialogFooter}
          style={{ width: '450px' }}
          modal
        >
          <div className="flex flex-column gap-3">
            <div>
              <label htmlFor="nombre" className="block mb-2 font-medium">Nombre *</label>
              <InputText
                id="nombre"
                value={club.nombre}
                onChange={(e) => onInputChange(e, 'nombre')}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="pais" className="block mb-2 font-medium">País</label>
              <InputText
                id="pais"
                value={club.pais}
                onChange={(e) => onInputChange(e, 'pais')}
                className="w-full"
              />
            </div>
            <ImageUpload
              label="Logo"
              value={club.logo}
              onChange={(url) => setClub((prev) => ({ ...prev, logo: url }))}
            />
            <div>
              <label htmlFor="fundacion" className="block mb-2 font-medium">Fundación *</label>
              <Calendar
                id="fundacion"
                value={parseDate(club.fundacion)}
                onChange={onDateChange}
                dateFormat="yy-mm-dd"
                className="w-full"
                inputClassName="w-full"
                showIcon
              />
            </div>
            <div>
              <label htmlFor="info" className="block mb-2 font-medium">Información</label>
              <InputTextarea
                id="info"
                value={club.info}
                onChange={(e) => onInputChange(e, 'info')}
                rows={5}
                className="w-full"
                autoResize
              />
            </div>
          </div>
        </Dialog>

        <Dialog
          visible={deleteDialogVisible}
          onHide={hideDeleteDialog}
          header="Confirmar eliminación"
          footer={deleteDialogFooter}
          modal
          style={{ width: '350px' }}
        >
          <p>¿Estás seguro de que querés eliminar el club <strong>{clubToDelete?.nombre}</strong>?</p>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default AdminClubsPage;
