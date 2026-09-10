import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DetailSkeleton from '@/components/common/skeletons/DetailSkeleton';
import apiService from '@/services/apiService';

const ClubInfoPage = () => {
    const [clubData, setClubData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { clubId } = router.query;

    useEffect(() => {
        if (clubId) {
            setLoading(true);
            apiService.fetchClubData(clubId)
                .then(data => setClubData(data))
                .finally(() => setLoading(false));
        }
    }, [clubId]);

    if (loading) {
        return <DetailSkeleton hasImage={false} lines={6} />;
    }

    return (
        <div className="card">
            <h1>{clubData.club || clubData.nombre}</h1>
            <p>{clubData.info}</p>
        </div>
    );
};

export default ClubInfoPage;
