import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import { Button } from 'primereact/button';
import { useRouter } from 'next/router';
import CarouselSkeleton from '@/components/common/skeletons/CarouselSkeleton';
import apiService from '@/services/apiService.js';

const NewsCarousel = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchNoticias = async () => {
            const data = await apiService.fetchNoticias();
            setNoticias(data);
            setLoading(false);
        };
        fetchNoticias();
    }, []);

    const noticiaTemplate = (noticia) => {
        return (
            <div className="noticia-card" onClick={() => router.push(`/news/${noticia.id}`)}>
                <div className="noticia-imagen-container">
                    <img
                        src={noticia.imagen}
                        alt={noticia.titulo}
                        className="noticia-imagen"
                    />
                    <div className="noticia-overlay">
                        <h3 className="noticia-titulo">{noticia.titulo}</h3>
                        <p className="noticia-fecha">{new Date(noticia.fecha).toLocaleDateString('es-AR')}</p>
                    </div>
                </div>
                <div className="noticia-contenido">
                    <p className="noticia-descripcion">{noticia.descripcion}</p>
                    <Button
                        label="Leer más"
                        icon="pi pi-arrow-right"
                        className="p-button-text p-button-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/news/${noticia.id}`);
                        }}
                    />
                </div>
            </div>
        );
    };

    if (loading) {
        return <CarouselSkeleton />;
    }

    return (
        <div className="news-carousel-container">
            <Carousel
                value={noticias}
                itemTemplate={noticiaTemplate}
                numVisible={1}
                numScroll={1}
                circular
                autoplayInterval={5000}
                showIndicators
                showNavigators
                className="news-carousel"
            />
        </div>
    );
};

export default NewsCarousel;
