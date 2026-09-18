import React from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import NewsCarousel from '@/components/specifics/NewsCarousel.jsx';

const HomePage = () => {
    const router = useRouter();

    return (
        <div className="card">
            <div className="flex justify-content-center mb-4">
                <h1>Bienvenido a Bohurt Argentina</h1>
            </div>
            <NewsCarousel />
            <footer className="mt-5 pt-4 text-center border-top-1 border-color-secondary">
                <p className="text-color-secondary m-0 mb-3">
                    ¿Tenés un club que no aparece? ¿Vas a organizar un torneo? ¿Tenés dudas o sugerencias?
                </p>
                <Button
                    label="Contactanos"
                    icon="pi pi-envelope"
                    className="p-button-outlined"
                    onClick={() => router.push('/contacto')}
                />
            </footer>
        </div>
    );
};

export default HomePage;
