import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DetailSkeleton from '@/components/common/skeletons/DetailSkeleton';
import apiService from '@/services/apiService';
import SeoHead from '@/components/common/SeoHead';

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

    const clubName = clubData?.club || clubData?.nombre || 'Club';
    const description = clubData?.info
        ? `${clubData.info.slice(0, 155)}${clubData.info.length > 155 ? '...' : ''}`
        : `Información del club ${clubName}.`;

    return (
        <>
            <SeoHead
                title={clubName}
                description={description}
                pathname={`/clubs/clubInfo/${clubId}`}
            />
            <div className="card">
                <h1>{clubName}</h1>
                <p>{clubData?.info}</p>
            </div>
        </>
    );
};

export default ClubInfoPage;
