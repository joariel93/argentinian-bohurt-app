import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import FormSubmitButton from '@/components/common/buttons/FormSubmitButton';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

const emptyTournament = {
  idEvento: null,
  idModalidad: 1,
  idGenero: 1,
  idCategoria: 1,
  idTipoTorneo: null,
  linkTransmision: '',
  password: '',
};

export default function TournamentForm({ tournament, onSave, editLoading = false }) {
  const { showError, showSuccess } = useToast();
  const actualTournament = tournament?.torneo || tournament;
  const isEditing = !!actualTournament?.id;

  const [tournamentData, setTournamentData] = useState(emptyTournament);
  const [eventos, setEventos] = useState([]);
  const [selectedModalidad, setSelectedModalidad] = useState(null);
  const [combatOptions, setCombatOptions] = useState([]);
  const [sexOptions, setSexOptions] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [tiposTorneo, setTiposTorneo] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [invitedClubs, setInvitedClubs] = useState([]);
  const [clubSearchResults, setClubSearchResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  useEffect(() => {
    Promise.all([
      apiService.fetchEvents(),
      apiService.fetchLookupGenero(),
      apiService.fetchLookupModalidad(),
      apiService.fetchLookupTipoTorneo(),
      apiService.fetchClubsSimplify(),
    ]).then(([evs, gen, mod, tipos, cls]) => {
      setEventos(evs || []);
      setSexOptions((gen || []).map((g) => ({ label: g.valor, value: g.id })));
      setModalidades((mod || []).map((m) => ({ label: m.valor, value: m.id })));
      setTiposTorneo([{ label: 'Ninguno', value: null }, ...(tipos || []).map((t) => ({ label: t.valor, value: t.id }))]);
      setClubs(cls || []);
    }).catch((err) => {
      showError('Error al cargar catálogos');
    });
  }, []);

  useEffect(() => {
    const t = tournament?.torneo || tournament;
    if (!t) {
      setTournamentData(emptyTournament);
      setSelectedModalidad(null);
      setInvitedClubs([]);
      return;
    }

    const tModalidadId = t.id_modalidad || t.idModalidad || 1;
    const modalidadOpt = modalidades.find((m) => m.value === tModalidadId) || null;
    setSelectedModalidad(modalidadOpt);

    const initialCatId = t.id_categoria || t.idCategoria || 1;

    setTournamentData({
      idEvento: t.id_evento || t.idEvento || null,
      idModalidad: tModalidadId,
      idGenero: t.id_genero || t.idGenero || 1,
      idCategoria: initialCatId,
      idTipoTorneo: t.id_tipo_torneo || t.idTipoTorneo || null,
      linkTransmision: t.linkTransmision || '',
      password: '',
    });

    setInvitedClubs(t.clubesInvitados || []);

    if (tModalidadId) {
      loadCategorias(tModalidadId, initialCatId);
    }
  }, [tournament, modalidades]);

  const loadCategorias = async (modalidadId, categoriaId) => {
    if (!modalidadId || modalidadId === 3) {
      setCombatOptions([]);
      return;
    }
    const tipos = await apiService.fetchTiposCombate(modalidadId);
    const options = (tipos || []).map((t) => ({ label: t.label, value: t.value }));
    setCombatOptions(options);
    if (categoriaId && options.length > 0) {
      const match = options.find((o) => o.value === categoriaId);
      const selectedVal = match ? match.value : categoriaId;
      setTournamentData((prev) => ({ ...prev, idCategoria: selectedVal }));
    }
  };

  const handleEventoChange = (e) => {
    setTournamentData((prev) => ({ ...prev, idEvento: e.value }));
  };

  const handleModalidadChange = (e) => {
    const selected = e.value;
    setSelectedModalidad(selected);
    const modalidadId = selected && typeof selected === 'object' && 'value' in selected
      ? selected.value
      : (selected || 1);
    setTournamentData((prev) => ({ ...prev, idModalidad: modalidadId, idCategoria: 1 }));
    loadCategorias(modalidadId);
  };

  const handleInputChange = (e, field) => {
    setTournamentData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleDropdownChange = (e, field) => {
    const value = e.value && typeof e.value === 'object' && 'value' in e.value
      ? e.value.value
      : e.value;
    setTournamentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClubSelect = (e) => {
    const club = e.value;
    if (!club || typeof club !== 'object' || !club.id) return;
    if (!invitedClubs.some((invited) => invited.id === club.id)) {
      setInvitedClubs([...invitedClubs, club]);
    }
  };

  const filterClubs = (e) => {
    const q = (e.query || '').toLowerCase();
    setClubSearchResults(clubs.filter((c) => c.nombre.toLowerCase().includes(q)));
  };

  const handleRemoveClub = (club) => {
    setInvitedClubs(invitedClubs.filter((c) => c.id !== club.id));
  };

  const validate = () => {
    if (!tournamentData.idEvento) {
      showError('Debés seleccionar un evento');
      return false;
    }
    if (!tournamentData.idModalidad || !tournamentData.idCategoria || !tournamentData.idGenero) {
      showError('Modalidad, categoría y género son requeridos');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    const finalData = {
      idEvento: tournamentData.idEvento,
      idGenero: tournamentData.idGenero,
      idCategoria: tournamentData.idCategoria,
      idModalidad: tournamentData.idModalidad,
      idTipoTorneo: tournamentData.idTipoTorneo,
      linkTransmision: tournamentData.linkTransmision || null,
      password: tournamentData.password || undefined,
    };

    try {
      let result;
      if (isEditing) {
        result = await apiService.updateTournament(actualTournament.id, finalData);
      } else {
        result = await apiService.adminCreateTorneo(finalData);
      }

      setSubmitting(false);
      if (result.error) {
        showError(result.error);
        return;
      }

      showSuccess(isEditing ? 'Torneo actualizado exitosamente' : 'Torneo creado exitosamente');
      if (!isEditing && result.password) {
        setOtpValue(result.password);
        setShowOtpDialog(true);
      }
      onSave && onSave(result);
    } catch (error) {
      setSubmitting(false);
      const message = error?.response?.data?.error || error.message || 'Error al guardar el torneo';
      showError(message);
    }
  };

  return (
    <div>
      {editLoading ? (
        <div className="flex justify-content-center align-items-center p-4">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
        </div>
      ) : (
        <>
          <fieldset>
            <legend>Información Principal</legend>
            <div className="p-fluid">
              <div className="container flex justify-content-around flex-wrap">
                <div className="p-field col-12 md:col-6 m-2">
                  <label htmlFor="idEvento">Evento *</label>
                  <Dropdown
                    id="idEvento"
                    value={tournamentData.idEvento}
                    options={eventos.map((e) => ({ label: `${e.nombre} · ${e.fechaEvento} · ${e.localizacion}`, value: e.id }))}
                    onChange={handleEventoChange}
                    placeholder="Seleccione un evento"
                    className="w-full"
                    disabled={submitting}
                    filter
                  />
                </div>
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="genero">Género *</label>
                  <Dropdown
                    id="genero"
                    value={tournamentData.idGenero}
                    options={sexOptions}
                    onChange={(e) => handleDropdownChange(e, 'idGenero')}
                    placeholder="Seleccione un género"
                    className="w-full"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="container flex justify-content-around flex-wrap">
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="modalidad">Modalidad *</label>
                  <Dropdown
                    id="modalidad"
                    value={selectedModalidad}
                    options={modalidades}
                    onChange={handleModalidadChange}
                    optionLabel="label"
                    placeholder="Seleccione una modalidad"
                    className="w-full"
                    disabled={submitting}
                  />
                </div>
                {selectedModalidad && (typeof selectedModalidad === 'object' ? selectedModalidad.value : selectedModalidad) !== 3 && (
                  <div className="p-field col-12 md:col-3 m-2">
                    <label htmlFor="categoria">Categoría *</label>
                    <Dropdown
                      id="categoria"
                      value={tournamentData.idCategoria}
                      options={combatOptions}
                      onChange={(e) => handleDropdownChange(e, 'idCategoria')}
                      placeholder="Seleccione una categoría"
                      className="w-full"
                      disabled={submitting}
                    />
                  </div>
                )}
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="tipoTorneo">Tipo de torneo</label>
                  <Dropdown
                    id="tipoTorneo"
                    value={tournamentData.idTipoTorneo}
                    options={tiposTorneo}
                    onChange={(e) => handleDropdownChange(e, 'idTipoTorneo')}
                    placeholder="Seleccione un tipo"
                    className="w-full"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="container flex justify-content-around flex-wrap">
                <div className="p-field col-12 md:col-5 m-2">
                  <label htmlFor="linkTransmision">Link de transmisión en vivo</label>
                  <InputText
                    id="linkTransmision"
                    value={tournamentData.linkTransmision}
                    onChange={(e) => handleInputChange(e, 'linkTransmision')}
                    placeholder="https://youtube.com/..."
                    className="w-full"
                    disabled={submitting}
                  />
                </div>
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="password">Password / OTP</label>
                  <InputText
                    id="password"
                    value={tournamentData.password}
                    onChange={(e) => handleInputChange(e, 'password')}
                    placeholder="Autogenerado al guardar"
                    className="w-full"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Clubes Invitados</legend>
            <p className="text-color-secondary text-xs mb-2">
              Los clubes invitados también pueden administrarse desde el evento. Acá quedan como referencia.
            </p>
            <div className="p-field flex flex-wrap">
              <div className="col-12 md:col-4 flex flex-column m-2">
                <label htmlFor="club">Buscar club:</label>
                <AutoComplete
                  id="club"
                  value={selectedClub}
                  suggestions={clubSearchResults}
                  completeMethod={filterClubs}
                  field="nombre"
                  onChange={(e) => setSelectedClub(e.value)}
                  onSelect={handleClubSelect}
                  placeholder="Escriba el nombre de un club"
                  disabled={submitting}
                />
              </div>
              <div className="col-12 md:col-7 m-2">
                <DataTable value={invitedClubs} className="p-mt-3">
                  <Column field="nombre" header="Club" className="col-11" />
                  <Column
                    className="col-1"
                    body={(row) => (
                      <Button icon="pi pi-trash" className="p-button-text" onClick={() => handleRemoveClub(row)} />
                    )}
                    style={{ textAlign: 'center' }}
                  />
                </DataTable>
              </div>
            </div>
          </fieldset>

          <div className="mt-3 flex justify-content-end gap-2">
            <FormSubmitButton
              loading={submitting || editLoading}
              label="Guardar Torneo"
              icon="pi pi-check"
              onClick={handleSubmit}
              disabled={editLoading}
            />
          </div>

          <Dialog
            header="Código OTP del torneo"
            visible={showOtpDialog}
            onHide={() => setShowOtpDialog(false)}
            footer={
              <div>
                <Button label="Copiar" icon="pi pi-copy" onClick={() => navigator.clipboard.writeText(otpValue)} className="p-button-text" />
                <Button label="Cerrar" icon="pi pi-check" onClick={() => setShowOtpDialog(false)} />
              </div>
            }
          >
            <div className="text-center">
              <p className="text-color-secondary">Compartí este código con el organizador/marshalls para acceder al torneo.</p>
              <h2 className="text-4xl font-bold tracking-widest my-3">{otpValue}</h2>
              <p className="text-xs text-color-secondary">Se muestra una sola vez. Guardalo en un lugar seguro.</p>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
}
