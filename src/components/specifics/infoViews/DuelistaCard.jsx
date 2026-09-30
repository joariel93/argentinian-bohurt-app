import { useRouter } from 'next/router';
import DuelistaIconBadge from './DuelistaIconBadge';

export default function DuelistaCard({ peleador }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/peleadores/${peleador.idUsuario}`);
  };

  // Tomar las categorías únicas donde participó (deduplicadas).
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

  return (
    <div
      onClick={handleClick}
      className="border-round surface-card p-3 cursor-pointer hover:surface-hover transition-all transition-duration-200"
      style={{
        border: '1px solid var(--surface-border)',
        position: 'relative',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {/* Esquina superior derecha: iconos de categorías */}
      <div
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          display: 'flex',
          gap: '0.25rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          maxWidth: '70%',
        }}
      >
        {categoriasUnicas.slice(0, 4).map((t, i) => (
          <DuelistaIconBadge
            key={`${t.idTorneo}-${i}`}
            categoria={t.categoria}
            genero={t.genero}
            modalidad={t.modalidad}
          />
        ))}
        {categoriasUnicas.length > 4 && (
          <span className="text-xs text-color-secondary">+{categoriasUnicas.length - 4}</span>
        )}
      </div>

      <div className="flex align-items-center gap-2">
        {/* Imagen genérica */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--surface-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <i
            className="pi pi-user"
            style={{ fontSize: '1.8rem', color: 'var(--text-color-secondary)' }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="font-bold text-sm" style={{ lineHeight: '1.2' }}>
            {peleador.apellido}, {peleador.nombre}
          </div>
        </div>
      </div>

      <div
        className="flex gap-2 text-xs text-color-secondary"
        style={{ marginTop: 'auto' }}
      >
        <span title="Combates reales (sin byes)">
          <i className="pi pi-bolt mr-1" />
          {peleador.combates || 0}
        </span>
        <span title="Victorias" style={{ color: 'var(--green-500)' }}>
          <i className="pi pi-check-circle mr-1" />
          {peleador.victorias || 0}
        </span>
        <span title="Derrotas" style={{ color: 'var(--red-500)' }}>
          <i className="pi pi-times-circle mr-1" />
          {peleador.derrotas || 0}
        </span>
        {peleador.amarillas > 0 && (
          <span title="Tarjetas amarillas" style={{ color: 'var(--yellow-500)' }}>
            <i className="pi pi-exclamation-triangle mr-1" />
            {peleador.amarillas}
          </span>
        )}
      </div>
    </div>
  );
}
