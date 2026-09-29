import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import AdminRoute from '@/components/admin/AdminRoute';
import EventForm from '@/components/specifics/forms/EventForm';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

export default function NuevoEvento() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [initialOtp, setInitialOtp] = useState('');
  const [createdEvento, setCreatedEvento] = useState(null);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadOtp = async () => {
      const data = await apiService.generateUniqueOtp();
      if (data?.otp) setInitialOtp(data.otp);
    };
    loadOtp();
  }, []);

  const handleSave = async (values) => {
    setSubmitting(true);
    const payload = {
      ...values,
      password: initialOtp,
    };
    const result = await apiService.createEvent(payload);
    setSubmitting(false);
    if (result?.error) {
      showError(result.error);
      return;
    }
    setCreatedEvento(result);
    setShowOtpDialog(true);
    showSuccess('Evento creado exitosamente');
  };

  return (
    <AdminRoute>
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="text-3xl font-bold m-0">Nuevo Evento</h1>
          <Button label="Volver al listado" icon="pi pi-arrow-left" className="p-button-text" onClick={() => router.push('/admin/events')} />
        </div>

        <EventForm
          mode="create"
          initialData={{ password: initialOtp }}
          onSubmit={handleSave}
        />

        <Dialog
          visible={showOtpDialog}
          onHide={() => setShowOtpDialog(false)}
          header="Evento creado"
          modal
          style={{ width: '400px' }}
          footer={
            <Button
              label="Ir al listado"
              icon="pi pi-arrow-right"
              onClick={() => router.push('/admin/events')}
            />
          }
        >
          <p>El evento fue creado con los siguientes OTPs:</p>
          <ul className="m-0 pl-3">
            <li><strong>Evento:</strong> {createdEvento?.password}</li>
            {(createdEvento?.torneos || []).map((t) => (
              <li key={t.id}><strong>Torneo:</strong> {t.password}</li>
            ))}
          </ul>
        </Dialog>
      </div>
    </AdminRoute>
  );
}
