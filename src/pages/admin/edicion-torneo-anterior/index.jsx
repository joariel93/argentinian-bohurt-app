import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import AdminRoute from '@/components/admin/AdminRoute';
import TournamentLoadWizard from '@/components/specifics/wizards/TournamentLoadWizard';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

export default function EdicionTorneoAnterior() {
  const router = useRouter();
  const { eventoId } = router.query;
  const { showError } = useToast();

  const [torneos, setTorneos] = useState([]);
  const [loadingTorneos, setLoadingTorneos] = useState(false);
  const [selectedTorneoId, setSelectedTorneoId] = useState(null);
  const [eventoNombre, setEventoNombre] = useState('');

  const loadTorneos = useCallback(async (id) => {
    setLoadingTorneos(true);
    setSelectedTorneoId(null);
    try {
      const data = await apiService.fetchTournamentsByEvent(id);
      setTorneos(Array.isArray(data) ? data : []);
    } catch (err) {
      showError(err.message || 'Error al cargar torneos del evento');
      setTorneos([]);
    } finally {
      setLoadingTorneos(false);
    }
  }, [showError]);

  const loadEvento = useCallback(async (id) => {
    try {
      const data = await apiService.fetchEvent(id);
      if (data?.nombre) setEventoNombre(data.nombre);
    } catch {
      // no critico
    }
  }, []);

  useEffect(() => {
    if (!eventoId) return;
    loadTorneos(eventoId);
    loadEvento(eventoId);
  }, [eventoId, loadTorneos, loadEvento]);

  const torneoOptions = torneos.map((t) => ({
    value: t.id,
    label: [t.modalidad, t.categoria, t.sexo].filter(Boolean).join(' · ') + ` (ID: ${t.id})`,
  }));

  return (
    <AdminRoute>
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold m-0">Edicion de Torneo Anterior</h1>
            {eventoNombre && (
              <p className="text-color-secondary text-lg m-0 mt-1">
                Evento: <strong>{eventoNombre}</strong>
              </p>
            )}
          </div>
          <Button
            label="Volver a Eventos"
            icon="pi pi-arrow-left"
            className="p-button-text"
            onClick={() => router.push('/admin/events')}
          />
        </div>

        <div className="card mb-4 p-3">
          <div className="p-field">
            <label htmlFor="torneoSelector" className="mb-2 block font-semibold">
              Selecciona el torneo a editar
            </label>

            {!eventoId ? (
              <Message
                severity="warn"
                text="Esta pagina debe abrirse desde la lista de Eventos."
                className="w-full"
              />
            ) : loadingTorneos ? (
              <div className="flex align-items-center gap-2">
                <ProgressSpinner style={{ width: '24px', height: '24px' }} strokeWidth="4" />
                <span className="text-color-secondary">Cargando torneos del evento...</span>
              </div>
            ) : torneos.length === 0 ? (
              <Message
                severity="info"
                text="Este evento no tiene torneos cargados aun."
                className="w-full"
              />
            ) : (
              <Dropdown
                id="torneoSelector"
                value={selectedTorneoId}
                options={torneoOptions}
                onChange={(e) => setSelectedTorneoId(e.value)}
                placeholder="Selecciona un torneo para editar..."
                optionLabel="label"
                optionValue="value"
                filter
                className="w-full"
              />
            )}
          </div>
        </div>

        {selectedTorneoId && (
          <TournamentLoadWizard key={selectedTorneoId} tournamentId={selectedTorneoId} />
        )}
      </div>
    </AdminRoute>
  );
}
