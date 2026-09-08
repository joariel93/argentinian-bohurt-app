import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import apiService from '@/services/apiService';

export default function OrganizerInfo({ organizerId }) {
    const [organizerData, setOrganizerData] = useState({
        nombre: '',
        torneos: []
    });

    useEffect(() => {
        if (organizerId) {
            apiService.fetchClubData(organizerId).then(data => {
                if (data) {
                    setOrganizerData({
                        nombre: data.club || data.nombre || 'Organizador',
                        torneos: data.teams || []
                    });
                }
            });
        }
    }, [organizerId]);

    return (
        <div className="card">
            <h1>{organizerData.nombre}</h1>
            <fieldset>
                <legend>Torneos del Organizador</legend>
                <DataTable value={organizerData.torneos}>
                    <Column field="nombre" header="Nombre"></Column>
                    <Column header="Modalidad" body={(rowData) => (rowData.modalidades || []).map((m) => m.nombre).join(', ')}></Column>
                </DataTable>
            </fieldset>
        </div>
    );
}
