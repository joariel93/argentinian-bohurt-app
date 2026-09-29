import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminTournamentsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/events');
  }, [router]);
  return <div className="card text-center p-6"><p>Redirigiendo a Eventos...</p></div>;
}
