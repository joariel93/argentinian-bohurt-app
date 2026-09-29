import { useEffect } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/common/SeoHead';

export default function TournamentsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/events');
  }, [router]);
  return (
    <>
      <SeoHead title="Eventos" pathname="/events" />
      <div className="card text-center p-6">
        <p>Redirigiendo a Eventos...</p>
      </div>
    </>
  );
}
