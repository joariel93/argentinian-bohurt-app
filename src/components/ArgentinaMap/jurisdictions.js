const GBA_PARTIDOS = new Set([
  "Almirante Brown",
  "Avellaneda",
  "Berazategui",
  "Esteban Echeverría",
  "Ezeiza",
  "Florencio Varela",
  "General San Martín",
  "Hurlingham",
  "Ituzaingó",
  "José C. Paz",
  "La Matanza",
  "Lanús",
  "Lomas de Zamora",
  "Malvinas Argentinas",
  "Merlo",
  "Moreno",
  "Morón",
  "Quilmes",
  "San Fernando",
  "San Isidro",
  "San Miguel",
  "Tigre",
  "Tres de Febrero",
  "Vicente López",
]);

export const JURISDICTIONS = {
  caba: {
    id: "caba",
    label: "Ciudad Autónoma de Buenos Aires",
    shortLabel: "CABA",
  },
  gba: {
    id: "gba",
    label: "Gran Buenos Aires",
    shortLabel: "GBA",
  },
  buenos_aires_interior: {
    id: "buenos_aires_interior",
    label: "Buenos Aires — Interior",
    shortLabel: "Interior de Buenos Aires",
  },
  catamarca: { id: "catamarca", label: "Catamarca", shortLabel: "Catamarca" },
  chaco: { id: "chaco", label: "Chaco", shortLabel: "Chaco" },
  chubut: { id: "chubut", label: "Chubut", shortLabel: "Chubut" },
  cordoba: { id: "cordoba", label: "Córdoba", shortLabel: "Córdoba" },
  corrientes: { id: "corrientes", label: "Corrientes", shortLabel: "Corrientes" },
  entre_rios: { id: "entre_rios", label: "Entre Ríos", shortLabel: "Entre Ríos" },
  formosa: { id: "formosa", label: "Formosa", shortLabel: "Formosa" },
  jujuy: { id: "jujuy", label: "Jujuy", shortLabel: "Jujuy" },
  la_pampa: { id: "la_pampa", label: "La Pampa", shortLabel: "La Pampa" },
  la_rioja: { id: "la_rioja", label: "La Rioja", shortLabel: "La Rioja" },
  mendoza: { id: "mendoza", label: "Mendoza", shortLabel: "Mendoza" },
  misiones: { id: "misiones", label: "Misiones", shortLabel: "Misiones" },
  neuquen: { id: "neuquen", label: "Neuquén", shortLabel: "Neuquén" },
  rio_negro: { id: "rio_negro", label: "Río Negro", shortLabel: "Río Negro" },
  salta: { id: "salta", label: "Salta", shortLabel: "Salta" },
  san_juan: { id: "san_juan", label: "San Juan", shortLabel: "San Juan" },
  san_luis: { id: "san_luis", label: "San Luis", shortLabel: "San Luis" },
  santa_cruz: { id: "santa_cruz", label: "Santa Cruz", shortLabel: "Santa Cruz" },
  santa_fe: { id: "santa_fe", label: "Santa Fe", shortLabel: "Santa Fe" },
  santiago_del_estero: {
    id: "santiago_del_estero",
    label: "Santiago del Estero",
    shortLabel: "Santiago del Estero",
  },
  tierra_del_fuego: {
    id: "tierra_del_fuego",
    label: "Tierra del Fuego",
    shortLabel: "Tierra del Fuego",
  },
  tucuman: { id: "tucuman", label: "Tucumán", shortLabel: "Tucumán" },
};

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function provinceId(value) {
  const p = normalize(value);

  const aliases = {
    "ciudad autonoma de buenos aires": "caba",
    "caba": "caba",
    "buenos aires": "buenos_aires",
    "catamarca": "catamarca",
    "chaco": "chaco",
    "chubut": "chubut",
    "cordoba": "cordoba",
    "corrientes": "corrientes",
    "entre rios": "entre_rios",
    "formosa": "formosa",
    "jujuy": "jujuy",
    "la pampa": "la_pampa",
    "la rioja": "la_rioja",
    "mendoza": "mendoza",
    "misiones": "misiones",
    "neuquen": "neuquen",
    "rio negro": "rio_negro",
    "salta": "salta",
    "san juan": "san_juan",
    "san luis": "san_luis",
    "santa cruz": "santa_cruz",
    "santa fe": "santa_fe",
    "santiago del estero": "santiago_del_estero",
    "tierra del fuego": "tierra_del_fuego",
    "tucuman": "tucuman",
  };

  return aliases[p] ?? null;
}

export function getClubJurisdiction(club) {
  if (club?.ciudad === "CABA" || !club?.provincia) return "caba";
  if (club?.provincia === "Gran Buenos Aires") return "gba";
  if (club?.provincia === "Buenos Aires") return "buenos_aires_interior";
  return provinceId(club?.provincia);
}

export function getFeatureJurisdiction(feature) {
  const p = feature?.properties ?? {};

  const province =
    p.provincia ??
    p.PROVINCIA ??
    p.province ??
    p.Provincia ??
    p.nombre_provincia ??
    "";

  const department =
    p.departamento ??
    p.DEPARTAMENTO ??
    p.department ??
    p.nombre ??
    p.NOMBRE ??
    p.name ??
    p.NAME ??
    "";

  const normalizedProvince = provinceId(province);

  if (normalizedProvince === "caba") return "caba";

  if (normalizedProvince === "buenos_aires") {
    if (GBA_PARTIDOS.has(String(department).trim())) {
      return "gba";
    }
    return "buenos_aires_interior";
  }

  return normalizedProvince;
}
