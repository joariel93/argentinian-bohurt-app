import { useRouter } from 'next/router';
import TournamentLoadWizard from '@/components/specifics/wizards/TournamentLoadWizard';

export default function EditarTorneoPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return null;

  return <TournamentLoadWizard tournamentId={id} />;
}
