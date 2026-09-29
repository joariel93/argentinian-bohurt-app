import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TournamentDetailRedirect() {
  const router = useRouter();
  const { tournamentId } = router.query;
  useEffect(() => {
    if (tournamentId) router.replace(`/events/${tournamentId}`);
    else router.replace('/events');
  }, [router, tournamentId]);
  return <div className="card text-center p-6"><p>Redirigiendo...</p></div>;
}
