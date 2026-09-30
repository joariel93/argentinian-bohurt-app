// Icono de badge para la card del duelista. Por ahora usa un único ícono compartido
// (modalidad-duelo.svg). Más adelante se mapeará por categoría.
export default function DuelistaIconBadge({ categoria, genero, modalidad }) {
  // Color según género.
  const colorGenero =
    genero === 'Femenino'
      ? '#ec4899' // pink-500
      : genero === 'Masculino'
      ? '#3b82f6' // blue-500
      : '#a855f7'; // purple-500

  return (
    <div
      title={`${modalidad || ''} · ${categoria || ''} · ${genero || ''}`.trim().replace(/^·\s|·\s$/g, '')}
      style={{
        width: '1.6rem',
        height: '1.6rem',
        borderRadius: '50%',
        background: colorGenero,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      <img
        src="/modalidad-duelo.svg"
        alt={categoria || 'duelo'}
        style={{ width: '0.95rem', height: '0.95rem', filter: 'brightness(0) invert(1)' }}
      />
    </div>
  );
}
