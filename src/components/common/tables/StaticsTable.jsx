import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import apiService from '@/services/apiService';

export default function StaticsTable({ idClub }) {
    const [stats, setStats] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkViewport = () => setIsMobile(window.innerWidth <= 768);
        checkViewport();
        window.addEventListener('resize', checkViewport);
        return () => window.removeEventListener('resize', checkViewport);
    }, []);

    const columns = [
        { field: 'torneo', header: 'Torneo' },
        { field: 'combates', header: isMobile ? 'C' : 'Combates' },
        { field: 'victorias', header: isMobile ? 'V' : 'Victorias' },
        { field: 'derrotas', header: isMobile ? 'D' : 'Derrotas' },
        { field: 'roundsGanados', header: isMobile ? 'RG' : 'Rounds ganados' },
        { field: 'roundsPerdidos', header: isMobile ? 'RP' : 'Rounds perdidos' },
    ];

    useEffect(() => {
        apiService.fetchClubStats(idClub).then((data) => setStats(data));
    }, [idClub]);

    return (
        <div className="card">
            <div className="table-responsive">
                <DataTable value={stats} stripedRows size='small' scrollable scrollHeight="flex">
                    {columns.map((col) => (
                        <Column key={col.field} field={col.field} header={col.header} />
                    ))}
                </DataTable>
            </div>
        </div>
    );
}
