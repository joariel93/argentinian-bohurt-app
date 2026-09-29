import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminCombatesRedirect() {
  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    if (id) router.replace(`/admin/events/${id}/combates`);
    else router.replace('/admin/events');
  }, [router, id]);
  return <div className="card text-center p-6"><p>Redirigiendo...</p></div>;
}
