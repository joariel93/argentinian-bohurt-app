import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import NewsDetailSkeleton from '@/components/common/skeletons/NewsDetailSkeleton';
import apiService from '@/services/apiService';

const NoticiaPage = () => {
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (router.query.id) {
            apiService.fetchNoticiaById(router.query.id).then(data => {
                setNoticia(data);
                setLoading(false);
            });
        }
    }, [router.query.id]);

    if (loading) {
        return <NewsDetailSkeleton />;
    }

    if (!noticia) {
        return (
            <div className="card noticia-detail">
                <h1>Noticia no encontrada</h1>
                <Button label="Volver al inicio" icon="pi pi-home" onClick={() => router.push('/')} />
            </div>
        );
    }

    return (
        <div className="card noticia-detail">
            <Button
                label="Volver"
                icon="pi pi-arrow-left"
                className="p-button-text mb-4"
                onClick={() => router.push('/news/')}
            />

            <div className="noticia-imagen-detail">
                <img src={noticia.imagen} alt={noticia.titulo} />
            </div>

            <div className="noticia-contenido-detail">
                <h1 className="noticia-titulo-detail">{noticia.titulo}</h1>
                <h2 className="noticia-subtitulo-detail">{noticia.subtitulo}</h2>

                <div className="noticia-meta">
                    <span className="noticia-fecha-detail">
                        <i className="pi pi-calendar mr-2"></i>
                        {new Date(noticia.fecha).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                    <span className="noticia-autor-detail">
                        <i className="pi pi-user mr-2"></i>
                        {noticia.autor}
                    </span>
                </div>

                <div className="noticia-cuerpo">
                    {noticia.cuerpo.split('\n\n').map((parrafo, index) => (
                        <p key={index}>{parrafo}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NoticiaPage;
