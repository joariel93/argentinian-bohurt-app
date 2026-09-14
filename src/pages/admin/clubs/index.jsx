import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { ProgressSpinner } from 'primereact/progressspinner';
import AdminRoute from '@/components/admin/AdminRoute';
import ImageUpload from '@/components/common/inputs/ImageUpload';
import SocialLinksInput from '@/components/common/inputs/SocialLinksInput';
import FormSubmitButton from '@/components/common/buttons/FormSubmitButton';
import TableSkeleton from '@/components/common/skeletons/TableSkeleton';
import apiService from '@/services/apiService.js';
import { useToast } from '@/contexts/ToastContext';

const emptyClub = {
  id: null,
  nombre: '',
  pais: '',
  ciudad: '',
  logo: '',
  fundacion: '',
  info: '',
  redesSociales: [],
};

const AdminClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [club, setClub] = useState(emptyClub);
  const [isEditing, setIsEditing] = useState(false);
  const [redesSocialesOptions, setRedesSocialesOptions] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [clubToDelete, setClubToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const loadClubs = async () => {
    setLoading(true);
    try {
      const [data, redesData] = await Promise.all([
        apiService.fetchClubs(),
        apiService.fetchLookupRedesSociales(),
      ]);
      setClubs(data);
      setRedesSocialesOptions(redesData);
    } catch (err) {
      showError(err.message || 'Error al cargar clubes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const openNew = () => {
    setClub(emptyClub);
    setIsEditing(false);
    setDialogVisible(true);
  };

  const openEdit = async (rowData) => {
    setIsEditing(true);
    setDialogVisible(true);
    setEditLoading(true);
    setClub(emptyClub);
    try {
      const data = await apiService.fetchClubData(rowData.id);
      if (data.error) {
        showError(data.error);
        setDialogVisible(false);
        return;
      }
      setClub({
        id: rowData.id,
        nombre: data.club || '',
        pais: data.country || '',
        ciudad: data.ciudad || '',
        provincia: data.provincia || '',
        logo: data.logo || '',
        fundacion: data.foundation || '',
        info: data.info || '',
        redesSociales: mapRedesToForm(data.redesSociales),
      });
    } catch (err) {
      showError(err.message || 'Error al cargar el club');
      setDialogVisible(false);
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDelete = (rowData) => {
    setClubToDelete(rowData);
    setDeleteDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setEditLoading(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setClubToDelete(null);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setClub((prev) => ({ ...prev, [name]: val }));
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
    setClub((prev) => ({ ...prev, fundacion: formatted }));
  };

  const saveClub = async () => {
    if (!club.nombre || !club.fundacion) {
      showError('Nombre y fundación son requeridos');
      return;
    }

    setSubmitting(true);
    const payload = {
      nombre: club.nombre,
      pais: club.pais || null,
      logo: club.logo || null,
      ciudad: club.ciudad || null,
      provincia: club.provincia || null,
      fundacion: club.fundacion,
      info: club.info || null,
      redesSociales: mapRedesToPayload(club.redesSociales),
    };

    let result;
    if (isEditing) {
      result = await apiService.updateClub(club.id, payload);
    } else {
      result = await apiService.createClub(payload);
    }

    setSubmitting(false);
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

    setDeleting(true);
    const result = await apiService.deleteClub(clubToDelete.id);
    setDeleting(false);
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
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} disabled={submitting || editLoading} />
      <FormSubmitButton loading={submitting || editLoading} label="Guardar" onClick={saveClub} disabled={editLoading} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} disabled={deleting} />
      <FormSubmitButton loading={deleting} label="Sí" icon="pi pi-check" className="p-button-danger" onClick={deleteClub} />
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

        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : (
          <DataTable value={clubs} paginator rows={10} responsiveLayout="scroll">
            <Column body={logoBodyTemplate} header="Logo" style={{ width: '80px' }} />
            <Column field="nombre" header="Nombre" sortable />
            <Column field="country" header="País" sortable />
            <Column field="ciudad" header="Ciudad" sortable />
            <Column field="provincia" header="Provincia" sortable />
            <Column body={actionBodyTemplate} header="Acciones" style={{ width: '120px' }} />
          </DataTable>
        )}

        <Dialog
          visible={dialogVisible}
          onHide={hideDialog}
          header={isEditing ? 'Editar Club' : 'Nuevo Club'}
          footer={dialogFooter}
          style={{ width: '450px' }}
          modal
        >
          {editLoading ? (
            <div className="flex justify-content-center align-items-center p-4">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            </div>
          ) : (
            <div className="flex flex-column gap-3">
              <div>
                <label htmlFor="nombre" className="block mb-2 font-medium">Nombre *</label>
                <InputText
                  id="nombre"
                  value={club.nombre}
                  onChange={(e) => onInputChange(e, 'nombre')}
                  className="w-full"
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="pais" className="block mb-2 font-medium">País</label>
                <InputText
                  id="pais"
                  value={club.pais}
                  onChange={(e) => onInputChange(e, 'pais')}
                  className="w-full"
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="ciudad" className="block mb-2 font-medium">Ciudad</label>
                <InputText
                  id="ciudad"
                  value={club.ciudad}
                  onChange={(e) => onInputChange(e, 'ciudad')}
                  className="w-full"
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="provincia" className="block mb-2 font-medium">Provincia</label>
                <InputText
                  id="provincia"
                  value={club.provincia}
                  onChange={(e) => onInputChange(e, 'provincia')}
                  className="w-full"
                  disabled={submitting}
                />
              </div>
              <ImageUpload
                label="Logo"
                value={club.logo}
                onChange={(url) => setClub((prev) => ({ ...prev, logo: url }))}
                disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </div>
              <SocialLinksInput
                value={club.redesSociales}
                options={redesSocialesOptions}
                onChange={(redes) => !submitting && setClub((prev) => ({ ...prev, redesSociales: redes }))}
              />
            </div>
          )}
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
