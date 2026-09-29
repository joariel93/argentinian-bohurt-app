import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CargarTorneoRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/events/nuevo');
  }, [router]);
  return <div className="card text-center p-6"><p>Redirigiendo a Nuevo Evento...</p></div>;
}
