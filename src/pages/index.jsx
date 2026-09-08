import React from 'react';
import NewsCarousel from '@/components/specifics/NewsCarousel.jsx';

const HomePage = () => {
    return (
        <div className="card">
            <div className="flex justify-content-center mb-4">
                <h1>Bienvenido a Bohurt Argentina</h1>
            </div>
            <NewsCarousel />
        </div>
    );
};

export default HomePage;
