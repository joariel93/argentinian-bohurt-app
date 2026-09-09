import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AdminRoute from '@/components/admin/AdminRoute';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';
import { getYoutubeEmbedUrl } from '@/utils/youtube';

const AdminTournamentCombatesPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useToast();

  const [tournament, setTournament] = useState(null);
  const [combates, setCombates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const loadData = async (tournamentId) => {
    setLoading(true);
    const [info, combatesData] = await Promise.all([
      apiService.fetchTournamentInfoSimplify(tournamentId),
      apiService.fetchTournamentCombates(tournamentId),
    ]);
    setTournament(info);
    setCombates(combatesData?.combates || []);
    setLoading(false);
  };

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const handleLinkChange = (rowId, value) => {
    setCombates((prev) => prev.map((c) => (c.id === rowId ? { ...c, link: value } : c)));
  };

  const saveLink = async (combate) => {
    if (!combate.link) return;
    setSavingId(combate.id);
    const result = await apiService.updateCombateLink(id, combate.id, combate.link);
    setSavingId(null);
    if (result.error) {
      showError(result.error);
      return;
    }
    showSuccess('Link guardado');
  };

  const linkInputTemplate = (rowData) => (
    <div className="flex gap-2 align-items-center">
      <InputText
        value={rowData.link || ''}
        onChange={(e) => handleLinkChange(rowData.id, e.target.value)}
        placeholder="https://youtube.com/..."
        className="w-full"
      />
      <Button
        icon="pi pi-save"
        className="p-button-sm"
        loading={savingId === rowData.id}
        onClick={() => saveLink(rowData)}
        tooltip="Guardar link"
      />
    </div>
  );

  const previewTemplate = (rowData) => {
    if (!rowData.link) return <span className="text-color-secondary">Sin link</span>;
    const embedUrl = getYoutubeEmbedUrl(rowData.link);
    if (!embedUrl) return <span className="text-color-secondary">Link inválido</span>;
    return (
      <div style={{ width: '160px', height: '90px' }}>
        <iframe
          width="160"
          height="90"
          src={embedUrl}
          title={`Video combate ${rowData.orden}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  };

  const equiposTemplate = (rowData) => (
    <span>
      {rowData.nombreEquipoA || 'A'} vs {rowData.nombreEquipoB || 'B'}
    </span>
  );

  return (
    <AdminRoute>
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold m-0">Links de combates</h1>
            {tournament && <p className="m-0 text-color-secondary">{tournament.nombre}</p>}
          </div>
          <Button label="Volver" icon="pi pi-arrow-left" className="p-button-secondary" onClick={() => router.push('/admin/tournaments')} />
        </div>

        <DataTable value={combates} loading={loading} responsiveLayout="scroll">
          <Column field="orden" header="#" style={{ width: '60px' }} />
          <Column header="Equipos" body={equiposTemplate} />
          <Column field="fase" header="Fase" />
          <Column field="grupo" header="Grupo" />
          <Column field="ronda" header="Ronda" />
          <Column header="Link de YouTube" body={linkInputTemplate} style={{ width: '350px' }} />
          <Column header="Preview" body={previewTemplate} style={{ width: '180px' }} />
        </DataTable>
      </div>
    </AdminRoute>
  );
};

export default AdminTournamentCombatesPage;
