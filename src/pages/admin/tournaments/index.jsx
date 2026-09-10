import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/router';
import AdminRoute from '@/components/admin/AdminRoute';
import TournamentForm from '@/components/specifics/forms/TournamentForm';
import FormSubmitButton from '@/components/common/buttons/FormSubmitButton';
import TableSkeleton from '@/components/common/skeletons/TableSkeleton';
import apiService from '@/services/apiService.js';
import { useToast } from '@/contexts/ToastContext';

const AdminTournamentsPage = () => {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const tournamentsData = await apiService.fetchTournaments();
      setTournaments(tournamentsData);
    } catch (err) {
      showError(err.message || 'Error al cargar torneos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNew = () => {
    setTournament(null);
    setDialogVisible(true);
  };

  const openEdit = (rowData) => {
    setTournament(rowData);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setTournament(null);
  };

  const handleSave = () => {
    setDialogVisible(false);
    setTournament(null);
    loadData();
  };

  const confirmDelete = (rowData) => {
    setTournamentToDelete(rowData);
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setTournamentToDelete(null);
  };

  const deleteTournament = async () => {
    if (!tournamentToDelete) return;

    setDeleting(true);
    const result = await apiService.deleteTournament(tournamentToDelete.id);
    setDeleting(false);
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
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-sm" onClick={() => openEdit(rowData)} tooltip="Editar" />
      <Button icon="pi pi-video" className="p-button-rounded p-button-info p-button-sm" onClick={() => router.push(`/admin/tournaments/${rowData.id}/combates`)} tooltip="Links de combates" />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDelete(rowData)} tooltip="Eliminar" />
    </div>
  );

  const imageBodyTemplate = (rowData) => {
    if (!rowData.imagen) return <span className="text-color-secondary">Sin imagen</span>;
    return <img src={rowData.imagen} alt={rowData.nombre} style={{ width: '60px', height: '40px', objectFit: 'cover' }} />;
  };

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} disabled={deleting} />
      <FormSubmitButton loading={deleting} label="Sí" icon="pi pi-check" className="p-button-danger" onClick={deleteTournament} />
    </div>
  );

  return (
    <AdminRoute>
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h1 className="text-3xl font-bold m-0">Gestión de Torneos</h1>
          <div className="flex gap-2">
            <Button label="Cargar torneo pasado" icon="pi pi-history" className="p-button-secondary" onClick={() => router.push('/admin/cargar-torneo')} />
            <Button label="Nuevo Torneo" icon="pi pi-plus" onClick={openNew} />
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <DataTable value={tournaments} paginator rows={10} responsiveLayout="scroll">
            <Column body={imageBodyTemplate} header="Imagen" style={{ width: '100px' }} />
            <Column field="nombre" header="Nombre" sortable />
            <Column field="localizacion" header="Localización" sortable />
            <Column field="fechaTorneo" header="Fecha" sortable />
            <Column field="estado" header="Estado" sortable />
            <Column body={actionBodyTemplate} header="Acciones" style={{ width: '160px' }} />
          </DataTable>
        )}

        <Dialog
          visible={dialogVisible}
          onHide={hideDialog}
          header={tournament ? 'Editar Torneo' : 'Nuevo Torneo'}
          style={{ width: '800px' }}
          maximizable
          modal
        >
          <TournamentForm tournament={tournament} onSave={handleSave} />
        </Dialog>

        <Dialog visible={deleteDialogVisible} onHide={hideDeleteDialog} header="Confirmar eliminación" footer={deleteDialogFooter} modal style={{ width: '350px' }}>
          <p>¿Estás seguro de que querés eliminar el torneo <strong>{tournamentToDelete?.nombre}</strong>?</p>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default AdminTournamentsPage;
