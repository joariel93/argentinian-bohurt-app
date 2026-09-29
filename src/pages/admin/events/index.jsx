import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import AdminRoute from '@/components/admin/AdminRoute';
import TableSkeleton from '@/components/common/skeletons/TableSkeleton';
import FormSubmitButton from '@/components/common/buttons/FormSubmitButton';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

const STATUS_SEVERITY = {
  Pendiente: 'info',
  'En curso': 'warning',
  Finalizado: 'success',
};

const AdminEventsPage = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const loadEventos = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchEvents();
      setEventos(data);
    } catch (err) {
      showError(err.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventos();
  }, []);

  const handleNew = () => router.push('/admin/events/nuevo');

  const handleEdit = (row) => router.push(`/admin/events/${row.id}/editar`);

  const handleCombates = (row) => router.push(`/admin/events/${row.id}/combates`);

  const confirmDelete = (row) => {
    setEventoToDelete(row);
    setDeleteDialogVisible(true);
  };

  const deleteEvento = async () => {
    if (!eventoToDelete) return;
    setDeleting(true);
    const result = await apiService.deleteEvent(eventoToDelete.id);
    setDeleting(false);
    if (result.error) {
      showError(result.error);
      return;
    }
    showSuccess('Evento eliminado');
    setDeleteDialogVisible(false);
    setEventoToDelete(null);
    loadEventos();
  };

  const bannerTemplate = (rowData) => {
    if (!rowData.imagen) return <span className="text-color-secondary">Sin banner</span>;
    return <img src={rowData.imagen} alt={rowData.nombre} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />;
  };

  const categoriasTemplate = (rowData) => (
    <div className="flex flex-wrap gap-1">
      {(rowData.modalidades || []).map((m) => (
        <Tag key={m} value={m} severity="info" />
      ))}
    </div>
  );

  const statusTemplate = (rowData) => (
    <Tag
      value={rowData.estado || 'Pendiente'}
      severity={STATUS_SEVERITY[rowData.estado] || 'info'}
    />
  );

  const actionsTemplate = (rowData) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-button-sm"
        onClick={() => handleEdit(rowData)}
        tooltip="Editar"
      />
      <Button
        icon="pi pi-sitemap"
        className="p-button-rounded p-button-info p-button-sm"
        onClick={() => handleCombates(rowData)}
        tooltip="Combates"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => confirmDelete(rowData)}
        tooltip="Eliminar"
      />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteDialogVisible(false)} disabled={deleting} />
      <FormSubmitButton loading={deleting} label="Sí" icon="pi pi-check" className="p-button-danger" onClick={deleteEvento} />
    </div>
  );

  return (
    <AdminRoute>
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="text-3xl font-bold m-0">Gestión de Eventos</h1>
          <Button label="Nuevo Evento" icon="pi pi-plus" onClick={handleNew} />
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : (
          <DataTable value={eventos} paginator rows={10} responsiveLayout="scroll" emptyMessage="No hay eventos cargados">
            <Column body={bannerTemplate} header="Banner" style={{ width: '80px' }} />
            <Column field="nombre" header="Nombre" sortable />
            <Column field="localizacion" header="Localización" sortable />
            <Column field="fechaEvento" header="Fecha" sortable />
            <Column field="fechaCierreInscripcion" header="Cierre Inscripción" />
            <Column field="cantidadTorneos" header="Categorías" style={{ width: '100px' }} />
            <Column body={categoriasTemplate} header="Modalidades" />
            <Column body={statusTemplate} header="Estado" />
            <Column body={actionsTemplate} header="Acciones" style={{ width: '160px' }} />
          </DataTable>
        )}

        <Dialog
          visible={deleteDialogVisible}
          onHide={() => setDeleteDialogVisible(false)}
          header="Confirmar eliminación"
          footer={deleteDialogFooter}
          modal
          style={{ width: '350px' }}
        >
          <p>
            ¿Estás seguro de que querés eliminar el evento <strong>{eventoToDelete?.nombre}</strong>?
            Se eliminarán también todos sus torneos y combates.
          </p>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default AdminEventsPage;
