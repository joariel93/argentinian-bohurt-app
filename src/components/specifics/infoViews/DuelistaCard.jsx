import { useRouter } from 'next/router';
import DuelistaIconBadge from './DuelistaIconBadge';

export default function DuelistaCard({ peleador }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/peleadores/${peleador.idUsuario}`);
  };

  // Categorías únicas donde participó (deduplicadas).
  const categoriasUnicas = [];
  const seen = new Set();
  if (Array.isArray(peleador.torneos)) {
    for (const t of peleador.torneos) {
      const key = `${t.modalidad}|${t.categoria}|${t.genero}`;
      if (!seen.has(key)) {
        seen.add(key);
        categoriasUnicas.push(t);
      }
    }
  }

  // Tamaño adaptativo de badges según cantidad.
  const badgeSize =
    categoriasUnicas.length === 1
      ? '5rem'
      : categoriasUnicas.length <= 3
        ? '3.5rem'
        : '2.5rem';

  return (
    <div className="col-12 sm:col-6 lg:col-4 xl:col-3 p-2" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="border-1 surface-border surface-card border-round">

        {/* Sección superior: ícono + nombre */}
        <div className="flex flex-column align-items-center py-2">
          {/* Ícono genérico de usuario */}
          <div
            style={{
              width: '8rem',
              height: '8rem',
              borderRadius: '50%',
              background: 'var(--surface-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <i
              className="pi pi-user"
              style={{ fontSize: '4rem', color: 'var(--text-color-secondary)' }}
            />
          </div>

          {/* Nombre y apellido */}
          <div className="text-uppercase font-bold text-sm sm:text-base lg:text-lg mt-2 text-center px-2">
            {peleador.apellido}, {peleador.nombre}
          </div>
        </div>

        {/* Sección inferior: DuelistaIconBadge por cada categoría */}
        <div
          className="flex align-items-center justify-content-center p-3"
          style={{ flexWrap: 'wrap', gap: '0.5rem' }}
        >
          {categoriasUnicas.length > 0 ? (
            categoriasUnicas.map((t, i) => (
              <DuelistaIconBadge
                key={`${t.idTorneo}-${i}`}
                categoria={t.categoria}
                genero={t.genero}
                modalidad={t.modalidad}
                size={badgeSize}
              />
            ))
          ) : (
            <span className="text-color-secondary text-xs">Sin categorías</span>
          )}
        </div>

      </div>
    </div>
  );
}
