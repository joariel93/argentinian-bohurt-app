const modalidadIcons = {
  1: { src: '/modalidad-buhurt.svg', nombre: 'Buhurt' },
  2: { src: '/modalidad-duelo.svg', nombre: 'Duelo' },
  3: { src: '/modalidad-profight.svg', nombre: 'Profight' },
};

export function getModalidadIcon(idModalidad) {
  return modalidadIcons[idModalidad] || { src: '/modalidad-buhurt.svg', nombre: '' };
}
