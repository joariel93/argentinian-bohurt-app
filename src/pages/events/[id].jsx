import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Dialog } from 'primereact/dialog';
import apiService from '@/services/apiService';
import SeoHead from '@/components/common/SeoHead';
import { useToast } from '@/contexts/ToastContext';

const STATUS_SEVERITY = {
  Pendiente: 'info',
  'En curso': 'warning',
  Finalizado: 'success',
};

function formatDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-AR');
}

const EventDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useToast();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTorneoId, setSelectedTorneoId] = useState(null);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const data = await apiService.fetchEvent(id);
      if (!data || data.error) {
        router.replace('/events');
        return;
      }
      setEvento(data);
      if (data.torneos?.length > 0) setSelectedTorneoId(data.torneos[0].id);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleOtpSubmit = async () => {
    if (!otpValue || !evento) return;
    const result = await apiService.validateEventOtp(evento.id, otpValue);
    if (result?.valid) {
      showSuccess('OTP válido');
      setShowOtpDialog(false);
    } else {
      showError(result?.error || 'OTP inválido');
    }
  };

  if (loading) {
    return (
      <>
        <SeoHead title="Cargando..." pathname="/events" />
        <div className="card">
          <Skeleton width="100%" height="300px" className="mb-3" />
          <Skeleton width="60%" height="2rem" className="mb-2" />
          <Skeleton width="40%" height="1.5rem" />
        </div>
      </>
    );
  }

  if (!evento) return null;

  const selectedTorneo = evento.torneos?.find((t) => t.id === selectedTorneoId) || null;

  const description = evento.localizacion
    ? `${evento.nombre} en ${evento.localizacion}.`
    : `${evento.nombre} en Argentina.`;

  return (
    <>
      <SeoHead
        title={evento.nombre}
        description={description}
        pathname={`/events/${evento.id}`}
      />

      <div className="card">
        <div className="evento-banner mb-4" style={{ position: 'relative' }}>
          {evento.imagen && (
            <img src={evento.imagen} alt={evento.nombre} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '6px' }} />
          )}
          <div className="absolute" style={{ top: '1rem', right: '1rem' }}>
            <Tag value={evento.estado || 'Pendiente'} severity={STATUS_SEVERITY[evento.estado] || 'info'} />
          </div>
        </div>

        <div className="flex flex-column md:flex-row justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h1 className="m-0">{evento.nombre}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-color-secondary">
              <span><i className="pi pi-calendar mr-1" />{formatDate(evento.fechaEvento)}</span>
              <span><i className="pi pi-map-marker mr-1" />{evento.localizacion}</span>
              <span><i className="pi pi-clock mr-1" />Inscripciones hasta {formatDate(evento.fechaCierreInscripcion)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {evento.linkTransmision && (
              <Button
                label="Ver en vivo"
                icon="pi pi-video"
                onClick={() => window.open(evento.linkTransmision, '_blank')}
              />
            )}
            <Button
              label="Validar OTP"
              icon="pi pi-key"
              className="p-button-outlined"
              onClick={() => setShowOtpDialog(true)}
            />
          </div>
        </div>

        {evento.reglamento && (
          <div className="mb-3">
            <strong>Reglamento: </strong>
            {evento.reglamento.link ? (
              <a href={evento.reglamento.link} target="_blank" rel="noreferrer">{evento.reglamento.nombre}</a>
            ) : (
              evento.reglamento.nombre
            )}
          </div>
        )}

        {evento.redesSociales?.length > 0 && (
          <div className="mb-4 social-icons">
            {evento.redesSociales.map((rs) => (
              <Button
                key={rs.idRedSocial}
                icon={rs.iconClass}
                className="p-button-outlined p-button-rounded mx-1"
                onClick={() => rs.link && window.open(rs.link, '_blank')}
              />
            ))}
          </div>
        )}

        <h2>Categorías</h2>
        {evento.torneos?.length === 0 ? (
          <p className="text-color-secondary">Este evento aún no tiene categorías cargadas.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {evento.torneos.map((t) => (
                <Button
                  key={t.id}
                  label={`${t.modalidad} · ${t.categoria} · ${t.genero}`}
                  icon="pi pi-flag"
                  className={t.id === selectedTorneoId ? '' : 'p-button-outlined'}
                  onClick={() => setSelectedTorneoId(t.id)}
                />
              ))}
            </div>

            {selectedTorneo && (
              <div className="p-3 border-round surface-card">
                <h3 className="mt-0">{selectedTorneo.modalidad} · {selectedTorneo.categoria} · {selectedTorneo.genero}</h3>
                <p className="text-color-secondary m-0">
                  Estado: <Tag value={selectedTorneo.estado || 'Pendiente'} severity={STATUS_SEVERITY[selectedTorneo.estado] || 'info'} />
                </p>
                <p className="text-color-secondary m-0">
                  {selectedTorneo.tipoTorneo ? `Formato: ${selectedTorneo.tipoTorneo}` : 'Formato a definir según inscriptos.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog
        visible={showOtpDialog}
        onHide={() => setShowOtpDialog(false)}
        header="Validar OTP del Evento"
        modal
        style={{ width: '350px' }}
        footer={
          <Button label="Validar" icon="pi pi-check" onClick={handleOtpSubmit} disabled={!otpValue} />
        }
      >
        <div className="flex flex-column gap-2">
          <label htmlFor="otp">Código OTP del organizador</label>
          <input
            id="otp"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value)}
            className="p-inputtext p-component"
            placeholder="123456"
          />
        </div>
      </Dialog>
    </>
  );
};

export default EventDetailPage;
