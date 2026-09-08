import React, { useState, useEffect } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import apiService from '@/services/apiService'; 
import { useRouter } from 'next/router';

export default function DetailStaticsTable({ idTeam }) {
    const [stats, setStats] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter(); 

    useEffect(() => {
        const checkViewport = () => setIsMobile(window.innerWidth <= 768);
        checkViewport();
        window.addEventListener('resize', checkViewport);
        return () => window.removeEventListener('resize', checkViewport);
    }, []);

    useEffect(() => {
        apiService.fetchTeamTournamentStats(idTeam).then((data) => {
            const transformedStats = data.map((node, index) => ({
                key: index.toString(),
                data: { ...node },
                children: node.torneos.map((torneo, childIndex) => ({
                    key: `${index}-${childIndex}`,
                    data: { ...torneo }
                }))
            }));
            setStats(transformedStats);
        });
    }, [idTeam]);

    const handleTournamentClick = (tournamentId) => {
        router.push(`/tournaments/${tournamentId}`);
    };

    return (
        <div className="card">
            <div className="table-responsive">
                <TreeTable value={stats} stripedRows scrollable scrollHeight="flex">
                <Column
                    field="categoria"
                    header={isMobile ? "Categoría" : "Categoría / Torneo"}
                    expander
                    body={(tournament) => (
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => !tournament.children && handleTournamentClick(tournament.data.id)} 
                        >
                            {tournament.children ? tournament.data.categoria : tournament.data.torneo}
                        </span>
                    )}
                />
                <Column field="combates" header={isMobile ? "C" : "Combates"} />
                <Column field="victorias" header={isMobile ? "V" : "Victorias"} />
                <Column field="derrotas" header={isMobile ? "D" : "Derrotas"} />
                <Column field="roundsGanados" header={isMobile ? "RG" : "Rounds ganados"} />
                <Column field="roundsPerdidos" header={isMobile ? "RP" : "Rounds perdidos"} />
            </TreeTable>
            </div>
        </div>
    );
}
