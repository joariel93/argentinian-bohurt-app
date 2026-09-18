import { useState, useEffect } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import apiService from '@/services/apiService';
import ArgentinaMap from '@/components/ArgentinaMap/ArgentinaMap';
import { bohurtContent } from '@/data/bohurt-content';
import SeoHead from '@/components/common/SeoHead';

export default function DondeEntrenarPage() {
    const { map } = bohurtContent;
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClubs = async () => {
            setLoading(true);
            const allClubs = await apiService.fetchClubs();
            const argentinaClubs = (allClubs || []).filter((club) => {
                const pais = club.country || '';
                return pais.toLowerCase() === 'ar';
            });
            setClubs(argentinaClubs);
            setLoading(false);
        };
        loadClubs();
    }, []);

    return (
        <>
            <SeoHead
                title="¿Dónde puedo entrenar?"
                description="Encontrá clubes de Bohurt y combate medieval histórico en cada provincia de Argentina."
                pathname="/donde-entrenar"
            />
            <div className="card">
                <div className="text-center mb-4">
                    <h1>¿Dónde puedo entrenar?</h1>
                    <p className="m-0 mb-3 text-color-secondary">{map.description}</p>
                </div>

            {loading ? (
                <div className="flex justify-content-center align-items-center p-4">
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                </div>
            ) : (
                <ArgentinaMap clubs={clubs} />
            )}
        </div>
        </>
    );
}