import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
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

export default function TournamentForm({ tournament, onSave }) {
  const { showError, showSuccess } = useToast();
  const isEditing = !!tournament?.id;

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
  }, []);

  useEffect(() => {
    if (!tournament) {
      setTournamentData(emptyTournament);
      setSelectedModalidad(null);
      setInvitedClubs([]);
      return;
    }

    const modalidadOpt = modalidades.find((m) => m.value === tournament.idModalidad) || modalidades[0];
    setSelectedModalidad(modalidadOpt);

    setTournamentData({
      nombre: tournament.nombre || '',
      fechaTorneo: tournament.fechaTorneo || '',
      fechaCierreInscripcion: tournament.fechaCierreInscripcion || '',
      localizacion: tournament.localizacion || '',
      idModalidad: tournament.idModalidad || 1,
      idGenero: tournament.id_genero || tournament.idGenero || 1,
      idCategoria: tournament.id_categoria || tournament.idCategoria || 1,
      idReglamento: tournament.idReglamento || 1,
      idTipoTorneo: tournament.idTipoTorneo || null,
      imagen: tournament.imagen || '',
      linkTransmision: tournament.linkTransmision || '',
      password: tournament.password || '',
    });

    setInvitedClubs(tournament.clubesInvitados || []);

    if (tournament.idModalidad) {
      loadCategorias(tournament.idModalidad, tournament.id_categoria || tournament.idCategoria);
    }
  }, [tournament, modalidades]);

  const loadCategorias = async (modalidadId, categoriaId) => {
    if (!modalidadId || modalidadId === 3) {
      setCombatOptions([]);
      return;
    }
    const tipos = await apiService.fetchTiposCombate(modalidadId);
    setCombatOptions(tipos.map((t) => ({ label: t.label, value: t.value })));
    if (categoriaId) {
      setTournamentData((prev) => ({ ...prev, idCategoria: categoriaId }));
    }
  };

  const handleModalidadChange = (e) => {
    const selected = e.value;
    setSelectedModalidad(selected);
    const modalidadId = selected?.value || 1;
    setTournamentData((prev) => ({ ...prev, idModalidad: modalidadId, idCategoria: 1 }));
    loadCategorias(modalidadId);
  };

  const handleInputChange = (e, field) => {
    setTournamentData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleDropdownChange = (e, field) => {
    setTournamentData((prev) => ({ ...prev, [field]: e.value }));
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
    };

    try {
      let result;
      if (isEditing) {
        result = await apiService.updateTournament(tournament.id, finalData);
      } else {
        result = await apiService.adminCreateTorneo(finalData);
      }

      if (result.error) {
        showError(result.error);
        return;
      }

      showSuccess(isEditing ? 'Torneo actualizado exitosamente' : 'Torneo creado exitosamente');
      onSave && onSave(result);
    } catch (error) {
      const message = error?.response?.data?.error || error.message || 'Error al guardar el torneo';
      showError(message);
    }
  };

  return (
    <div>
      <fieldset>
        <legend>Información Principal</legend>
        <div className="p-fluid">
          <div className="container flex justify-content-around flex-wrap">
            <div className="p-field m-3 p-2 col-12 md:col-5">
              <label htmlFor="nombre">Nombre del Torneo *</label>
              <InputText id="nombre" value={tournamentData.nombre} onChange={(e) => handleInputChange(e, 'nombre')} className="w-full" />
            </div>
            <div className="p-field m-3 p-2 col-12 md:col-5">
              <label htmlFor="localizacion">Localización *</label>
              <InputText id="localizacion" value={tournamentData.localizacion} onChange={(e) => handleInputChange(e, 'localizacion')} className="w-full" />
            </div>
          </div>
          <div className="container flex justify-content-around flex-wrap">
            <div className="p-field col-12 md:col-3 m-2">
              <label htmlFor="fechaTorneo">Fecha del Torneo *</label>
              <InputText id="fechaTorneo" type="date" value={tournamentData.fechaTorneo} onChange={(e) => handleInputChange(e, 'fechaTorneo')} className="w-full" />
            </div>
            <div className="p-field col-12 md:col-3 m-2">
              <label htmlFor="fechaCierreInscripcion">Cierre de Inscripción *</label>
              <InputText id="fechaCierreInscripcion" type="date" value={tournamentData.fechaCierreInscripcion} onChange={(e) => handleInputChange(e, 'fechaCierreInscripcion')} className="w-full" />
            </div>
            <div className="p-field col-12 md:col-3 m-2">
              <label htmlFor="genero">Género</label>
              <Dropdown id="genero" value={tournamentData.idGenero} options={sexOptions} onChange={(e) => handleDropdownChange(e, 'idGenero')} placeholder="Seleccione un género" className="w-full" />
            </div>
          </div>
          <div className="container flex justify-content-around flex-wrap">
            <div className="p-field col-12 md:col-3 m-2">
              <label htmlFor="reglamento">Reglamento</label>
              <Dropdown id="reglamento" value={tournamentData.idReglamento} options={reglamentOptions} onChange={(e) => handleDropdownChange(e, 'idReglamento')} placeholder="Seleccione un reglamento" className="w-full" />
            </div>
            <div className="p-field col-12 md:col-3 m-2">
              <label htmlFor="modalidad">Modalidad</label>
              <Dropdown id="modalidad" value={selectedModalidad} options={modalidades} onChange={handleModalidadChange} optionLabel="label" placeholder="Seleccione una modalidad" className="w-full" />
            </div>
            {selectedModalidad && selectedModalidad.value !== 3 && (
              <div className="p-field col-12 md:col-3 m-2">
                <label htmlFor="categoria">Categoría</label>
                {selectedModalidad.value === 2 ? (
                  <MultiSelect
                    id="categoria"
                    value={tournamentData.idCategoria}
                    options={combateOptions}
                    display="chip"
                    onChange={(e) => handleDropdownChange(e, 'idCategoria')}
                    placeholder="Seleccione categorías"
                    className="w-full"
                  />
                ) : (
                  <Dropdown
                    id="categoria"
                    value={tournamentData.idCategoria}
                    options={combateOptions}
                    onChange={(e) => handleDropdownChange(e, 'idCategoria')}
                    placeholder="Seleccione una categoría"
                    className="w-full"
                  />
                )}
              </div>
            )}
          </div>
          <div className="container flex justify-content-around flex-wrap">
            <div className="p-field col-12 md:col-3 m-2">
              <label htmlFor="tipoTorneo">Tipo de torneo</label>
              <Dropdown id="tipoTorneo" value={tournamentData.idTipoTorneo} options={tiposTorneo} onChange={(e) => handleDropdownChange(e, 'idTipoTorneo')} placeholder="Seleccione un tipo" className="w-full" />
            </div>
            <div className="p-field col-12 md:col-3 m-2">
              <label htmlFor="imagen">Imagen (URL)</label>
              <InputText id="imagen" value={tournamentData.imagen} onChange={(e) => handleInputChange(e, 'imagen')} placeholder="https://..." className="w-full" />
            </div>
            <div className="p-field col-12 md:col-3 m-2">
              <label htmlFor="linkTransmision">Link de transmisión en vivo</label>
              <InputText id="linkTransmision" value={tournamentData.linkTransmision} onChange={(e) => handleInputChange(e, 'linkTransmision')} placeholder="https://youtube.com/..." className="w-full" />
            </div>
          </div>
          <div className="container flex justify-content-around flex-wrap">
            <div className="p-field col-12 md:col-3 m-2">
              <label htmlFor="password">Password / OTP</label>
              <InputText id="password" value={tournamentData.password} onChange={(e) => handleInputChange(e, 'password')} className="w-full" />
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
      </fieldset>

      <div className="mt-3 flex justify-content-end gap-2">
        <Button label="Guardar Torneo" icon="pi pi-check" onClick={handleSubmit} />
      </div>
    </div>
  );
}
