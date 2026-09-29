import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import AdminRoute from '@/components/admin/AdminRoute';
import EventForm from '@/components/specifics/forms/EventForm';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

export default function EditarEvento() {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useToast();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const data = await apiService.fetchEventForAdmin(id);
      if (data?.error) {
        showError(data.error);
        router.push('/admin/events');
        return;
      }
      setEvento(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSave = async (values) => {
    const result = await apiService.updateEvent(id, values);
    if (result?.error) {
      showError(result.error);
      return;
    }
    showSuccess('Evento actualizado');
    router.push('/admin/events');
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="flex justify-content-center align-items-center p-6">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="text-3xl font-bold m-0">Editar Evento</h1>
          <Button label="Volver al listado" icon="pi pi-arrow-left" className="p-button-text" onClick={() => router.push('/admin/events')} />
        </div>

        <EventForm
          mode="edit"
          initialData={evento}
          onSubmit={handleSave}
        />
      </div>
    </AdminRoute>
  );
}
