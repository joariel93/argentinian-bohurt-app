import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import apiService from '@/services/apiService';

export default function TournamentInfo({ tournamentId }) {
    const [tournamentData, setTournamentData] = useState({
        nombre: '',
        fechaTorneo: '',
        fechaCierreInscripcion: '',
        localizacion: '',
        modalidadId: '',
        sexo: '',
        tipoCombate: '',
        categoria: null,
        clubesInvitados: []
    });

    useEffect(() => {
        if (tournamentId) {
            apiService.fetchTournamentInfoSimplify(tournamentId).then(data => setTournamentData(data));
        }
    }, [tournamentId]);

    return (
        <div>
            <fieldset>
                <legend>Información Principal</legend>
                <div className="p-fluid">
                    <h1>{tournamentData.nombre}</h1>
                    <div className='container flex justify-content-around'>
                        <div className="p-field m-3 p-2 col-4">
                            <FloatLabel>
                                <InputText id="localizacion" value={tournamentData.localizacion} disabled />
                                <label htmlFor="localizacion">Localización</label>
                            </FloatLabel>
                        </div>
                        <div className="p-field col-4">
                            <FloatLabel>
                                <InputText id="fechaTorneo" type="date" value={tournamentData.fechaTorneo} disabled />
                                <label htmlFor="fechaTorneo">Fecha del Torneo</label>
                            </FloatLabel>
                        </div>
                        <div className="p-field col-4">
                            <FloatLabel>
                                <InputText id="fechaCierreInscripcion" type="date" value={tournamentData.fechaCierreInscripcion} disabled />
                                <label htmlFor="fechaCierreInscripcion">Fecha de cierre de inscripciones</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <div className='container flex justify-content-around'>
                        <div className="p-field m-3 p-2 col-4">
                            <FloatLabel>
                                <InputText id="genero" value={tournamentData.sexo} disabled />
                                <label htmlFor="genero">Género</label>
                            </FloatLabel>
                        </div>
                        <div className="p-field m-3 p-2 col-4">
                            <FloatLabel>
                                <InputText id="modalidad" value={tournamentData.modalidad} disabled />
                                <label htmlFor="modalidad">Modalidad</label>
                            </FloatLabel>
                        </div>
                        {tournamentData.categoria != undefined && tournamentData.categoria != null ? (
                            <div className="p-field m-3 p-2 col-4">
                                <FloatLabel>
                                    <InputText id="categoria" value={tournamentData.categoria} disabled />
                                    <label htmlFor="categoria">Categoría</label>
                                </FloatLabel>
                            </div>
                        ) : null}
                    </div>
                </div>
            </fieldset>
            <fieldset>
                <legend>Inscriptos</legend>
                <DataTable value={tournamentData.clubesInvitados}>
                    <Column field="nombre" header="Club"></Column>
                </DataTable>
            </fieldset>
        </div>
    );
}
