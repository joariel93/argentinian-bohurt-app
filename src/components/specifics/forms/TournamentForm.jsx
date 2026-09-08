import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import apiService from '@/services/apiService';
import { useToast } from '@/contexts/ToastContext';

export default function TournamentForm({ tournamentId, otp }) {
    const { showError, showSuccess } = useToast();
    const [selectedModalidad, setSelectedModalidad] = useState(null);
    //const [seleccionoClub, setSeleccionoClub] = useState(false);
    const [combateOptions, setCombatOptions] = useState([]);
    const [sexOptions, setSexOptions] = useState([{ label: 'Masculino', value: 'M' }, { label: 'Femenino', value: 'F' }]);
    const [reglamentOptions, setReglamentOptions] = useState([]);
    const [modalidades, setModalidades] = useState([
        { label: 'Bohurt', value: '1' },
        { label: 'Duelos', value: '2' },
        { label: 'Profight', value: '3' }
    ]);
    const [clubs, setClubs] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [invitedClubs, setInvitedClubs] = useState([]);
    const [showNewClubModal, setShowNewClubModal] = useState(false);
    const [newClubInfo, setNewClubInfo] = useState({
        id: '',
        nombre: '',
        email: '',
        telefono: ''
    });
    const [clubSearchResults, setClubSearchResults] = useState([]);

    // Se define y se inicializa el estado de tournamentData
    const [tournamentData, setTournamentData] = useState({
        nombre: '',
        fechaTorneo: '',
        fechaCierreInscripcion: '',
        localizacion: '',
        modalidadId: '',
        sexo: '',
        reglamento: '',
        tipoCombate: '',
        clubesInvitados: []
    });

    useEffect(() => {
        apiService.fetchClubsSimplify().then(setClubs);
        apiService.fetchLookupReglamento().then((reglamentos) => {
            setReglamentOptions(reglamentos.map((r) => ({ label: r.nombre, value: r.id_reglamento })));
        });
    }, []);

    const [deleteClub, setDeleteClub] = useState(null); // Club seleccionado para eliminación
    const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Mostrar/ocultar modal

    // Función para abrir el modal de confirmación
    const confirmDeleteClub = (club) => {
        setDeleteClub(club);
        setShowDeleteDialog(true);
    };

    // Función para confirmar y eliminar el club
    const handleDelete = () => {
        setInvitedClubs(invitedClubs.filter(club => club.id !== deleteClub.id));
        setShowDeleteDialog(false);
        setDeleteClub(null);
    };

    // Función para cancelar la eliminación
    const handleCancelDelete = () => {
        setDeleteClub(null);
        setShowDeleteDialog(false);
    };

    // Renderiza el botón de eliminar en cada fila
    const deleteButtonTemplate = (rowData) => {
        return (
            <Button
                icon="pi pi-trash"
                className="p-button-text"
                onClick={() => confirmDeleteClub(rowData)}
            />
        );
    };

    const handleModalidadChange = (e) => {
        const selected = e.value;
        setSelectedModalidad(selected);

        const modalidadId = selected?.value || '';
        setTournamentData((prev) => ({ ...prev, modalidadId, tipoCombate: '' }));

        // Fetch combat types based on the selected modalidad
        if (modalidadId && modalidadId !== '3') {
            apiService.fetchTiposCombate(modalidadId).then((tiposCombate) => {
                setCombatOptions(tiposCombate);
            });
        } else {
            setCombatOptions([]);
        }
    };

    const handleClubSelect = (e) => {
        const club = e.value;

        if (club && !invitedClubs.some(invited => invited.id === club.id)) {
            setInvitedClubs([...invitedClubs, club]);
        }

        //setSelectedClub(null); // Limpiar el AutoComplete después de seleccionar
    };

    const handleInputChange = (e, field) => {

        setTournamentData({ ...tournamentData, [field]: e.target.value });
    };

    const handleNewClubChange = (e, field) => {
        setNewClubInfo({ ...newClubInfo, [field]: e.target.value });
    };

    const handleBlurClubInput = (e) => {
        setTimeout(() => {
            const inputValue = e.target.value;
            // Si el input no tiene valor (vacío) o el club ya ha sido seleccionado, no abrir el modal
            if (!inputValue //|| selectedClub
            ) {
                setSelectedClub(null);
                return;
            }

            // Verifica si el valor del input no coincide con un club existente
            if (!clubs.some(club => club.nombre.toLowerCase() === inputValue.toLowerCase()))
                setShowNewClubModal(true);
            setSelectedClub(null);
        }, 200);
    };

    const filterClubs = (e) => {
        const results = clubs.filter(club => club.nombre.toLowerCase().includes(e.query.toLowerCase()));
        setClubSearchResults(results);
    };

    const handleAddNewClub = () => {
        setInvitedClubs([...invitedClubs, newClubInfo]);
        setNewClubInfo({ nombre: '', email: '', telefono: '' });
        setShowNewClubModal(false);
        //setSeleccionoClub(false)
    };

    const handleSubmit = () => {
        const finalData = {
            ...tournamentData,
            clubesInvitados: invitedClubs
        };

        // Submit the tournament data to the API
        apiService.submitTournament(tournamentId, otp, finalData)
            .then(response => {
                showSuccess('Torneo creado exitosamente');
            })
            .catch(error => {
                const message = error?.response?.data?.error || error.message || 'Error al crear el torneo';
                showError(message);
            });
    };

    return (
        <div>
            <fieldset>
                <legend>Información Principal</legend>
                <div className="p-fluid">
                    <div className='container flex justify-content-around'>
                        <div className="p-field m-3 p-2 col-6">
                            <FloatLabel>
                                <InputText id="nombre" value={tournamentData.nombre} onChange={(e) => handleInputChange(e, 'nombre')} />
                                <label htmlFor="nombre">Nombre del Torneo</label>
                            </FloatLabel>
                        </div>
                        <div className="p-field m-3 p-2 col-6">
                            <FloatLabel>
                                <InputText id="localizacion" value={tournamentData.localizacion} onChange={(e) => handleInputChange(e, 'localizacion')} />
                                <label htmlFor="localizacion">Localización</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <div className='container flex justify-content-around'>
                        <div className="p-field col-4">
                            <label htmlFor="fechaTorneo">Fecha del Torneo</label>
                            <InputText id="fechaTorneo" type="date" value={tournamentData.fechaTorneo} onChange={(e) => handleInputChange(e, 'fechaTorneo')} />
                        </div>
                        <div className="p-field col-4">
                            <label htmlFor="fechaCierreInscripcion">Fecha de Cierre de Inscripción</label>
                            <InputText id="fechaCierreInscripcion" type="date" value={tournamentData.fechaCierreInscripcion} onChange={(e) => handleInputChange(e, 'fechaCierreInscripcion')} />
                        </div>
                        <div className="p-field col-4">
                            <label htmlFor="genero">Género</label>
                            <Dropdown id="genero" value={tournamentData.sexo} options={sexOptions} onChange={(e) => handleInputChange(e, 'sexo')} placeholder="Seleccione un género" />
                        </div>
                    </div>
                    <div className='container flex justify-content-around'>
                        <div className="p-field col-4">
                            <label htmlFor="reglamento">Reglamento</label>
                            <Dropdown id="reglamento" value={tournamentData.reglamento} options={reglamentOptions} onChange={(e) => handleInputChange(e, 'reglamento')} placeholder="Seleccione un reglamento (si no encuentra contáctese con el administrador)" />
                        </div>
                        <div className="p-field col-4">
                            <label htmlFor="modalidad">Modalidad</label>
                            <Dropdown id="modalidad" value={selectedModalidad} options={modalidades} onChange={handleModalidadChange} optionLabel="label" placeholder="Seleccione una modalidad" />
                        </div>
                        {selectedModalidad && (
                            <div className="p-field col-4">
                                <label htmlFor="categoria">Categoría</label>
                                {selectedModalidad.value === '2' ? (
                                    <MultiSelect
                                        id="categoria"
                                        value={tournamentData.tipoCombate}
                                        options={combateOptions}
                                        display='chip'
                                        onChange={(e) => handleInputChange(e, 'tipoCombate')}
                                        placeholder="Seleccione categorías"
                                    />
                                ) : (
                                    <Dropdown
                                        id="categoria"
                                        value={tournamentData.tipoCombate}
                                        options={combateOptions}
                                        onChange={(e) => handleInputChange(e, 'tipoCombate')}
                                        placeholder="Seleccione una categoría"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </fieldset>
            <fieldset>
                <legend>Clubes Invitados</legend>
                <div className="p-field flex" >
                    <div className='col-4 flex flex-column'>
                        <label htmlFor="club">Ingrese nombre de club: </label>
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
                    <div className='col-6'>
                        <DataTable value={invitedClubs} className="p-mt-3">
                            <Column field="nombre" header="Club" className='col-11' />
                            <Column
                                className='col-1'
                                body={deleteButtonTemplate} // Renderiza el botón de eliminar en esta columna
                                style={{ textAlign: 'center' }} />
                        </DataTable>
                    </div>
                </div>

                {/* Modal para agregar un nuevo club */}
                <Dialog header="Agregar Nuevo Club" visible={showNewClubModal} onHide={() => setShowNewClubModal(false)}>
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="newClubNombre">Nombre del Club</label>
                            <InputText id="newClubNombre" value={newClubInfo.nombre} onChange={(e) => handleNewClubChange(e, 'nombre')} required />
                        </div>
                        <div className="p-field">
                            <label htmlFor="newClubEmail">Email del Club</label>
                            <InputText id="newClubEmail" keyfilter="email" value={newClubInfo.email} onChange={(e) => handleNewClubChange(e, 'email')} required />
                        </div>
                        <div className="p-field">
                            <label htmlFor="newClubTelefono">Teléfono del Club</label>
                            <InputText id="newClubTelefono" keyfilter="num" mask="99-9999-9999" value={newClubInfo.telefono} onChange={(e) => handleNewClubChange(e, 'telefono')} required />
                        </div>
                        <Button label="Agregar Club" onClick={handleAddNewClub} />
                    </div>
                </Dialog>
                {/* Modal de confirmación eliminación de fila*/}
                <Dialog
                    header="Confirmar"
                    visible={showDeleteDialog}
                    onHide={handleCancelDelete}
                    footer={
                        <div>
                            <Button label="No" icon="pi pi-times" onClick={handleCancelDelete} className="p-button-text" />
                            <Button label="Sí" icon="pi pi-check" onClick={handleDelete} className="p-button-dark" />
                        </div>
                    }
                >
                    <p>¿Estás seguro de que deseas eliminar el club <b>{deleteClub?.nombre}</b>?</p>
                </Dialog>
            </fieldset>
            <div className="mt-2">
                <Button label="Finalizar Carga de Torneo" onClick={handleSubmit} />
            </div>
        </div>
    );
}
