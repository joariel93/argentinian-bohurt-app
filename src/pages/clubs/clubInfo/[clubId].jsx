import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import apiService from '@/services/apiService';

const ClubInfoPage = () => {
    const [clubData, setClubData] = useState(null);
    const router = useRouter();
    const { clubId } = router.query;

    useEffect(() => {
        if (clubId) {
            apiService.fetchClubData(clubId).then(data => setClubData(data));
        }
    }, [clubId]);

    if (!clubData) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="card">
            <h1>{clubData.club || clubData.nombre}</h1>
            <p>{clubData.info}</p>
        </div>
    );
};

export default ClubInfoPage;
