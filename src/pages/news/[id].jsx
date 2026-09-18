import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import NewsDetailSkeleton from '@/components/common/skeletons/NewsDetailSkeleton';
import apiService from '@/services/apiService';
import SeoHead from '@/components/common/SeoHead';

const NoticiaPage = () => {
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (id) {
            apiService.fetchNoticiaById(id).then(data => {
                setNoticia(data);
                setLoading(false);
            });
        }
    }, [id]);

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

    const description = noticia.subtitulo || noticia.descripcion || `Noticia de Bohurt Argentina: ${noticia.titulo}`;

    return (
        <>
            <SeoHead
                title={noticia.titulo}
                description={description}
                pathname={`/news/${id}`}
                image={noticia.imagen}
            />
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
        </>
    );
};

export default NoticiaPage;
