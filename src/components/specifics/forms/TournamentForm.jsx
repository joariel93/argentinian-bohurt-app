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
import ImageUpload from '@/components/common/inputs/ImageUpload';
import SocialLinksInput from '@/components/common/inputs/SocialLinksInput';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

const emptyTournament = {
  nombre: '',
  fechaTorneo: '',
  fechaCierreInscripcion: '',
  localizacion: '',
  idModalidad: 1,
  idGenero: 1,
  idCategoria: 1,
  idReglamento: 1,
  idTipoTorneo: null,
  imagen: '',
  linkTransmision: '',
  password: '',
};

export default function TournamentForm({ tournament, onSave, editLoading = false }) {
  const { showError, showSuccess } = useToast();
  const actualTournament = tournament?.torneo || tournament;
  const isEditing = !!actualTournament?.id;

  const [tournamentData, setTournamentData] = useState(emptyTournament);
  const [selectedModalidad, setSelectedModalidad] = useState(null);
  const [combateOptions, setCombatOptions] = useState([]);
  const [sexOptions, setSexOptions] = useState([]);
  const [reglamentOptions, setReglamentOptions] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [tiposTorneo, setTiposTorneo] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [invitedClubs, setInvitedClubs] = useState([]);
  const [showNewClubModal, setShowNewClubModal] = useState(false);
  const [clubSearchResults, setClubSearchResults] = useState([]);
  const [newClubInfo, setNewClubInfo] = useState({ nombre: '', email: '', telefono: '' });
  const [deleteClub, setDeleteClub] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redesSocialesOptions, setRedesSocialesOptions] = useState([]);
  const [redesSociales, setRedesSociales] = useState([]);

  useEffect(() => {
    apiService.fetchClubsSimplify().then(setClubs);
    apiService.fetchLookupGenero().then((data) => {
      setSexOptions(data.map((g) => ({ label: g.valor, value: g.id })));
    });
    apiService.fetchLookupModalidad().then((data) => {
      const opts = data.map((m) => ({ label: m.valor, value: m.id }));
      setModalidades(opts);
    });
    apiService.fetchLookupReglamento().then((data) => {
      setReglamentOptions(data.map((r) => ({ label: r.valor, value: r.id })));
    });
    apiService.fetchLookupTipoTorneo().then((data) => {
      setTiposTorneo([{ label: 'Ninguno', value: null }, ...data.map((t) => ({ label: t.valor, value: t.id }))]);
    });
    apiService.fetchLookupRedesSociales().then((data) => {
      setRedesSocialesOptions(data);
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

    const tModalidadId = t.id_modalidad || t.idModalidad || (modalidades.find((m) => m.label?.toLowerCase() === t.modalidad?.toLowerCase())?.value) || 1;
    const modalidadOpt = modalidades.find((m) => m.value === tModalidadId) || modalidades[0] || null;
    setSelectedModalidad(modalidadOpt);

    const rawCat = t.id_categoria || t.idCategoria || 1;
    const initialCatId = Array.isArray(rawCat) ? rawCat[0] : rawCat;

    setTournamentData({
      nombre: t.nombre || '',
      fechaTorneo: t.fechaTorneo ? String(t.fechaTorneo).split('T')[0] : '',
      fechaCierreInscripcion: t.fechaCierreInscripcion ? String(t.fechaCierreInscripcion).split('T')[0] : '',
      localizacion: t.localizacion || '',
      idModalidad: tModalidadId,
      idGenero: t.id_genero || t.idGenero || 1,
      idCategoria: initialCatId,
      idReglamento: t.id_reglamento || t.idReglamento || (typeof t.reglamento === 'object' ? t.reglamento?.id : 1) || 1,
      idTipoTorneo: t.id_tipo_torneo || t.idTipoTorneo || null,
      imagen: t.imagen || '',
      linkTransmision: t.linkTransmision || '',
      password: t.password || '',
    });

    setInvitedClubs(t.clubesInvitados || []);
    setRedesSociales(t.redesSociales || []);

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
    if (categoriaId) {
      const match = options.find((o) => o.value === categoriaId || o.label?.toLowerCase() === String(categoriaId).toLowerCase());
      const selectedVal = match ? match.value : (Array.isArray(categoriaId) ? categoriaId[0] : categoriaId);
      setTournamentData((prev) => ({ ...prev, idCategoria: selectedVal }));
    }
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
    if (club && !invitedClubs.some((invited) => invited.id === club.id)) {
      setInvitedClubs([...invitedClubs, club]);
    }
  };

  const filterClubs = (e) => {
    const results = clubs.filter((club) => club.nombre.toLowerCase().includes(e.query.toLowerCase()));
    setClubSearchResults(results);
  };

  const handleBlurClubInput = (e) => {
    setTimeout(() => {
      const inputValue = typeof e.target.value === 'string' ? e.target.value : '';
      if (!inputValue) {
        setSelectedClub(null);
        return;
      }
      if (!clubs.some((club) => club.nombre.toLowerCase() === inputValue.toLowerCase())) {
        setNewClubInfo({ ...newClubInfo, nombre: inputValue });
        setShowNewClubModal(true);
      }
      setSelectedClub(null);
    }, 200);
  };

  const handleNewClubChange = (e, field) => {
    setNewClubInfo((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddNewClub = () => {
    setInvitedClubs([...invitedClubs, newClubInfo]);
    setNewClubInfo({ nombre: '', email: '', telefono: '' });
    setShowNewClubModal(false);
  };

  const confirmDeleteClub = (club) => {
    setDeleteClub(club);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    setInvitedClubs(invitedClubs.filter((club) => club.id !== deleteClub.id && club.nombre !== deleteClub.nombre));
    setShowDeleteDialog(false);
    setDeleteClub(null);
  };

  const handleCancelDelete = () => {
    setDeleteClub(null);
    setShowDeleteDialog(false);
  };

  const deleteButtonTemplate = (rowData) => (
    <Button icon="pi pi-trash" className="p-button-text" onClick={() => confirmDeleteClub(rowData)} />
  );

  const validate = () => {
    if (!tournamentData.nombre || !tournamentData.localizacion || !tournamentData.fechaTorneo || !tournamentData.fechaCierreInscripcion) {
      showError('Nombre, localización y fechas son requeridos');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    const finalData = {
      nombre: tournamentData.nombre,
      localizacion: tournamentData.localizacion,
      fechaTorneo: tournamentData.fechaTorneo,
      fechaCierreInscripcion: tournamentData.fechaCierreInscripcion,
      idReglamento: tournamentData.idReglamento,
      idGenero: tournamentData.idGenero,
      idCategoria: tournamentData.idCategoria,
      idModalidad: tournamentData.idModalidad,
      idTipoTorneo: tournamentData.idTipoTorneo,
      imagen: tournamentData.imagen || null,
      linkTransmision: tournamentData.linkTransmision || null,
      password: tournamentData.password || null,
      clubesInvitados: invitedClubs,
      redesSociales: redesSociales.filter((r) => r.idRedSocial && r.link),
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
                <div className="p-field m-3 p-2 col-12 md:col-5">
                  <label htmlFor="nombre">Nombre del Torneo *</label>
                  <InputText id="nombre" value={tournamentData.nombre} onChange={(e) => handleInputChange(e, 'nombre')} className="w-full" disabled={submitting} />
                </div>
                <div className="p-field m-3 p-2 col-12 md:col-5">
                  <label htmlFor="localizacion">Localización *</label>
                  <InputText id="localizacion" value={tournamentData.localizacion} onChange={(e) => handleInputChange(e, 'localizacion')} className="w-full" disabled={submitting} />
                </div>
              </div>
              <div className="container flex justify-content-around flex-wrap">
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="fechaTorneo">Fecha del Torneo *</label>
                  <InputText id="fechaTorneo" type="date" value={tournamentData.fechaTorneo} onChange={(e) => handleInputChange(e, 'fechaTorneo')} className="w-full" disabled={submitting} />
                </div>
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="fechaCierreInscripcion">Cierre de Inscripción *</label>
                  <InputText id="fechaCierreInscripcion" type="date" value={tournamentData.fechaCierreInscripcion} onChange={(e) => handleInputChange(e, 'fechaCierreInscripcion')} className="w-full" disabled={submitting} />
                </div>
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="genero">Género</label>
                  <Dropdown id="genero" value={tournamentData.idGenero} options={sexOptions} onChange={(e) => handleDropdownChange(e, 'idGenero')} placeholder="Seleccione un género" className="w-full" disabled={submitting} />
                </div>
              </div>
              <div className="container flex justify-content-around flex-wrap">
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="reglamento">Reglamento</label>
                  <Dropdown id="reglamento" value={tournamentData.idReglamento} options={reglamentOptions} onChange={(e) => handleDropdownChange(e, 'idReglamento')} placeholder="Seleccione un reglamento" className="w-full" disabled={submitting} />
                </div>
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="modalidad">Modalidad</label>
                  <Dropdown id="modalidad" value={selectedModalidad} options={modalidades} onChange={handleModalidadChange} optionLabel="label" placeholder="Seleccione una modalidad" className="w-full" disabled={submitting} />
                </div>
                {selectedModalidad && (typeof selectedModalidad === 'object' ? selectedModalidad.value : selectedModalidad) !== 3 && (
                  <div className="p-field col-12 md:col-3 m-2">
                    <label htmlFor="categoria">Categoría</label>
                    <Dropdown
                      id="categoria"
                      value={Array.isArray(tournamentData.idCategoria) ? tournamentData.idCategoria[0] : tournamentData.idCategoria}
                      options={combateOptions}
                      onChange={(e) => handleDropdownChange(e, 'idCategoria')}
                      placeholder="Seleccione una categoría"
                      className="w-full"
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
              <div className="container flex justify-content-around flex-wrap">
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="tipoTorneo">Tipo de torneo</label>
                  <Dropdown id="tipoTorneo" value={tournamentData.idTipoTorneo} options={tiposTorneo} onChange={(e) => handleDropdownChange(e, 'idTipoTorneo')} placeholder="Seleccione un tipo" className="w-full" disabled={submitting} />
                </div>
                <div className="p-field col-12 md:col-3 m-2">
                  <ImageUpload
                    label="Imagen"
                    value={tournamentData.imagen}
                    onChange={(url) => setTournamentData((prev) => ({ ...prev, imagen: url }))}
                    disabled={submitting}
                  />
                </div>
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="linkTransmision">Link de transmisión en vivo</label>
                  <InputText id="linkTransmision" value={tournamentData.linkTransmision} onChange={(e) => handleInputChange(e, 'linkTransmision')} placeholder="https://youtube.com/..." className="w-full" disabled={submitting} />
                </div>
              </div>
              <div className="container flex justify-content-around flex-wrap">
                <div className="p-field col-12 md:col-3 m-2">
                  <label htmlFor="password">Password / OTP</label>
                  <InputText id="password" value={tournamentData.password} onChange={(e) => handleInputChange(e, 'password')} className="w-full" disabled={submitting} />
                </div>
              </div>
              <div className="container flex justify-content-around flex-wrap">
                <div className="p-field col-12 md:col-10 m-2">
                  <SocialLinksInput
                    label="Redes sociales del torneo"
                    value={redesSociales}
                    options={redesSocialesOptions}
                    onChange={(redes) => !submitting && setRedesSociales(redes)}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Clubes Invitados</legend>
            <div className="p-field flex flex-wrap">
              <div className="col-12 md:col-4 flex flex-column m-2">
                <label htmlFor="club">Ingrese nombre de club:</label>
                <AutoComplete
                  id="club"
                  value={selectedClub}
                  suggestions={clubSearchResults}
                  completeMethod={filterClubs}
                  field="nombre"
                  onChange={(e) => setSelectedClub(e.value)}
                  onSelect={handleClubSelect}
                  onBlur={handleBlurClubInput}
                  placeholder="Escriba el nombre de un club"
                  disabled={submitting}
                />
              </div>
              <div className="col-12 md:col-7 m-2">
                <DataTable value={invitedClubs} className="p-mt-3">
                  <Column field="nombre" header="Club" className="col-11" />
                  <Column className="col-1" body={deleteButtonTemplate} style={{ textAlign: 'center' }} />
                </DataTable>
              </div>
            </div>

            <Dialog header="Agregar Nuevo Club" visible={showNewClubModal} onHide={() => setShowNewClubModal(false)} style={{ width: '400px' }}>
              <div className="p-fluid">
                <div className="p-field mb-3">
                  <label htmlFor="newClubNombre">Nombre del Club</label>
                  <InputText id="newClubNombre" value={newClubInfo.nombre} onChange={(e) => handleNewClubChange(e, 'nombre')} required className="w-full" />
                </div>
                <div className="p-field mb-3">
                  <label htmlFor="newClubEmail">Email del Club</label>
                  <InputText id="newClubEmail" keyfilter="email" value={newClubInfo.email} onChange={(e) => handleNewClubChange(e, 'email')} required className="w-full" />
                </div>
                <div className="p-field mb-3">
                  <label htmlFor="newClubTelefono">Teléfono del Club</label>
                  <InputText id="newClubTelefono" value={newClubInfo.telefono} onChange={(e) => handleNewClubChange(e, 'telefono')} required className="w-full" />
                </div>
                <Button label="Agregar Club" onClick={handleAddNewClub} />
              </div>
            </Dialog>

            <Dialog
              header="Confirmar"
              visible={showDeleteDialog}
              onHide={handleCancelDelete}
              footer={
                <div>
                  <Button label="No" icon="pi pi-times" onClick={handleCancelDelete} className="p-button-text" />
                  <Button label="Sí" icon="pi pi-check" onClick={handleDelete} className="p-button-secondary" />
                </div>
              }
            >
              <p>¿Estás seguro de que deseas eliminar el club <b>{deleteClub?.nombre}</b>?</p>
            </Dialog>

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
          </fieldset>

          <div className="mt-3 flex justify-content-end gap-2">
            <FormSubmitButton loading={submitting || editLoading} label="Guardar Torneo" icon="pi pi-check" onClick={handleSubmit} disabled={editLoading} />
          </div>
        </>
      )}
    </div>
  );
}
