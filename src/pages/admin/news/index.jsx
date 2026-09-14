import React, { useState, useEffect } from 'react';
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
import FormSubmitButton from '@/components/common/buttons/FormSubmitButton';
import TableSkeleton from '@/components/common/skeletons/TableSkeleton';
import apiService from '@/services/apiService.js';
import { useToast } from '@/contexts/ToastContext';

const emptyNews = {
  id: null,
  titulo: '',
  subtitulo: '',
  descripcion: '',
  imagen: '',
  fecha: '',
  autor: '',
  cuerpo: '',
};

const AdminNewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newsItem, setNewsItem] = useState(emptyNews);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchNoticias();
      setNews(data);
    } catch (err) {
      showError(err.message || 'Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNew = () => {
    setNewsItem({ ...emptyNews, fecha: new Date().toISOString().split('T')[0] });
    setIsEditing(false);
    setDialogVisible(true);
  };

  const openEdit = async (rowData) => {
    setIsEditing(true);
    setDialogVisible(true);
    setEditLoading(true);
    setNewsItem(emptyNews);
    try {
      const data = await apiService.fetchNoticiaById(rowData.id);
      if (data.error) {
        showError(data.error);
        setDialogVisible(false);
        return;
      }
      setNewsItem({
        id: data.id,
        titulo: data.titulo || '',
        subtitulo: data.subtitulo || '',
        descripcion: data.descripcion || '',
        imagen: data.imagen || '',
        fecha: data.fecha || '',
        autor: data.autor || '',
        cuerpo: data.cuerpo || '',
      });
    } catch (err) {
      showError(err.message || 'Error al cargar la noticia');
      setDialogVisible(false);
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDelete = (rowData) => {
    setNewsToDelete(rowData);
    setDeleteDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setEditLoading(false);
  };
  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setNewsToDelete(null);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setNewsItem((prev) => ({ ...prev, [name]: val }));
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
    setNewsItem((prev) => ({ ...prev, fecha: formatted }));
  };

  const saveNews = async () => {
    if (!newsItem.titulo) {
      showError('El título es requerido');
      return;
    }

    setSubmitting(true);
    const payload = {
      titulo: newsItem.titulo,
      subtitulo: newsItem.subtitulo || null,
      descripcion: newsItem.descripcion || null,
      imagen: newsItem.imagen || null,
      fecha: newsItem.fecha || null,
      autor: newsItem.autor || null,
      cuerpo: newsItem.cuerpo || null,
    };

    let result;
    if (isEditing) {
      result = await apiService.updateNoticia(newsItem.id, payload);
    } else {
      result = await apiService.createNoticia(payload);
    }

    setSubmitting(false);
    if (result.error) {
      showError(result.error);
      return;
    }

    showSuccess(isEditing ? 'Noticia actualizada' : 'Noticia creada');
    setDialogVisible(false);
    loadData();
  };

  const deleteNews = async () => {
    if (!newsToDelete) return;

    setDeleting(true);
    const result = await apiService.deleteNoticia(newsToDelete.id);
    setDeleting(false);
    if (result.error) {
      showError(result.error);
      return;
    }
    showSuccess('Noticia eliminada');
    setDeleteDialogVisible(false);
    setNewsToDelete(null);
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
    return <img src={rowData.imagen} alt={rowData.titulo} style={{ width: '60px', height: '40px', objectFit: 'cover' }} />;
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} disabled={submitting || editLoading} />
      <FormSubmitButton loading={submitting || editLoading} label="Guardar" onClick={saveNews} disabled={editLoading} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} disabled={deleting} />
      <FormSubmitButton loading={deleting} label="Sí" icon="pi pi-check" className="p-button-danger" onClick={deleteNews} />
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
          <h1 className="text-3xl font-bold m-0">Gestión de Noticias</h1>
          <Button label="Nueva Noticia" icon="pi pi-plus" onClick={openNew} />
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <DataTable value={news} paginator rows={10} responsiveLayout="scroll">
            <Column body={imageBodyTemplate} header="Imagen" style={{ width: '100px' }} />
            <Column field="titulo" header="Título" sortable />
            <Column field="subtitulo" header="Subtítulo" sortable />
            <Column field="fecha" header="Fecha" sortable />
            <Column field="autor" header="Autor" sortable />
            <Column body={actionBodyTemplate} header="Acciones" style={{ width: '120px' }} />
          </DataTable>
        )}

        <Dialog visible={dialogVisible} onHide={hideDialog} header={isEditing ? 'Editar Noticia' : 'Nueva Noticia'} footer={dialogFooter} style={{ width: '600px' }} modal>
          {editLoading ? (
            <div className="flex justify-content-center align-items-center p-4">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            </div>
          ) : (
            <div className="flex flex-column gap-3">
              <div>
                <label className="block mb-2 font-medium">Título *</label>
                <InputText value={newsItem.titulo} onChange={(e) => onInputChange(e, 'titulo')} className="w-full" disabled={submitting} />
              </div>
              <div>
                <label className="block mb-2 font-medium">Subtítulo</label>
                <InputText value={newsItem.subtitulo} onChange={(e) => onInputChange(e, 'subtitulo')} className="w-full" disabled={submitting} />
              </div>
              <div>
                <label className="block mb-2 font-medium">Descripción</label>
                <InputTextarea value={newsItem.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} rows={3} className="w-full" disabled={submitting} />
              </div>
              <ImageUpload
                label="Imagen"
                value={newsItem.imagen}
                onChange={(url) => setNewsItem((prev) => ({ ...prev, imagen: url }))}
                disabled={submitting}
              />
              <div className="grid">
                <div className="col-6">
                  <label className="block mb-2 font-medium">Fecha</label>
                  <Calendar value={parseDate(newsItem.fecha)} onChange={onDateChange} dateFormat="yy-mm-dd" className="w-full" inputClassName="w-full" showIcon disabled={submitting} />
                </div>
                <div className="col-6">
                  <label className="block mb-2 font-medium">Autor</label>
                  <InputText value={newsItem.autor} onChange={(e) => onInputChange(e, 'autor')} className="w-full" disabled={submitting} />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium">Cuerpo</label>
                <InputTextarea value={newsItem.cuerpo} onChange={(e) => onInputChange(e, 'cuerpo')} rows={6} className="w-full" disabled={submitting} />
              </div>
            </div>
          )}
        </Dialog>

        <Dialog visible={deleteDialogVisible} onHide={hideDeleteDialog} header="Confirmar eliminación" footer={deleteDialogFooter} modal style={{ width: '350px' }}>
          <p>¿Estás seguro de que querés eliminar la noticia <strong>{newsToDelete?.titulo}</strong>?</p>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default AdminNewsPage;
