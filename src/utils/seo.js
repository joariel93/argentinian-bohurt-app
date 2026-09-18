const SITE_URL = 'https://bohurtargentina.vercel.app';
const DEFAULT_TITLE = 'Bohurt Argentina | Combate Medieval Histórico en Argentina';
const DEFAULT_DESCRIPTION =
  'Descubrí los clubes, equipos y torneos de Bohurt y combate medieval histórico en Argentina. Encontrá dónde entrenar, próximos eventos y toda la información de la comunidad.';
const DEFAULT_IMAGE = `${SITE_URL}/shield.png`;
const DEFAULT_TWITTER_HANDLE = '@bohurtargentina';

/**
 * Genera un objeto con las meta tags de SEO para usar con next/head.
 *
 * @param {Object} options
 * @param {string} [options.title] - Título de la página (sin sufijo del sitio).
 * @param {string} [options.description] - Descripción de la página.
 * @param {string} [options.pathname] - Path de la página, ej. '/clubs'.
 * @param {string} [options.image] - URL absoluta de la imagen Open Graph.
 * @param {string} [options.type] - Tipo Open Graph, por defecto 'website'.
 * @param {boolean} [options.noindex] - Si es true, agrega robots noindex.
 */
export function buildSeoTags({
  title,
  description,
  pathname = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
} = {}) {
  const pageTitle = title ? `${title} | Bohurt Argentina` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = `${SITE_URL}${pathname}`;
  const ogImage = image || DEFAULT_IMAGE;

  return {
    title: pageTitle,
    description: pageDescription,
    canonical: canonicalUrl,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      type,
      siteName: 'Bohurt Argentina',
      locale: 'es_AR',
      image: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      site: DEFAULT_TWITTER_HANDLE,
      title: pageTitle,
      description: pageDescription,
      image: ogImage,
    },
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
  };
}

export { SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE };
