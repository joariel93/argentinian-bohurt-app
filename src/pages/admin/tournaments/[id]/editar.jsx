import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminTournamentEditRedirect() {
  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    if (id) router.replace(`/admin/events/${id}/editar`);
    else router.replace('/admin/events');
  }, [router, id]);
  return <div className="card text-center p-6"><p>Redirigiendo...</p></div>;
}
