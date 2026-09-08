import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Skeleton } from 'primereact/skeleton';
import apiService from '@/services/apiService';

const NewsPage = () => {
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

    const handleNoticiaClick = (id) => {
        router.push(`/news/${id}`);
    };

    if (loading) {
        return (
            <div className="card">
                <h1 className="mb-4">Noticias</h1>
                <div className="grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="col-12 md:col-6 lg:col-4 p-3">
                            <Skeleton width="100%" height="200px" className="mb-3" />
                            <Skeleton width="80%" height="2rem" className="mb-2" />
                            <Skeleton width="60%" height="1.5rem" className="mb-3" />
                            <Skeleton width="100%" height="1rem" className="mb-2" />
                            <Skeleton width="100%" height="1rem" className="mb-2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h1 className="mb-4">Noticias</h1>
            <div className="grid">
                {noticias.map((noticia) => (
                    <div
                        key={noticia.id}
                        className="col-12 md:col-6 lg:col-4 p-3"
                        onClick={() => handleNoticiaClick(noticia.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="noticia-lista-card">
                            <div className="noticia-lista-imagen">
                                <img src={noticia.imagen} alt={noticia.titulo} />
                            </div>
                            <div className="noticia-lista-contenido">
                                <h3 className="noticia-lista-titulo">{noticia.titulo}</h3>
                                <h4 className="noticia-lista-subtitulo">{noticia.subtitulo}</h4>
                                <p className="noticia-lista-descripcion">{noticia.descripcion}</p>
                                <div className="noticia-lista-meta">
                                    <span className="noticia-lista-fecha">
                                        <i className="pi pi-calendar mr-2"></i>
                                        {new Date(noticia.fecha).toLocaleDateString('es-AR')}
                                    </span>
                                    <span className="noticia-lista-autor">
                                        <i className="pi pi-user mr-2"></i>
                                        {noticia.autor}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsPage;
