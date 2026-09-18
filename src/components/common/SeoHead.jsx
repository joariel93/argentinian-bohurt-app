import Head from 'next/head';
import { buildSeoTags } from '@/utils/seo';

export default function SeoHead({
  title,
  description,
  pathname = '/',
  image,
  type,
  noindex = false,
}) {
  const seo = buildSeoTags({ title, description, pathname, image, type, noindex });

  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={seo.robots} />
      <link rel="canonical" href={seo.canonical} />

      <meta property="og:title" content={seo.openGraph.title} />
      <meta property="og:description" content={seo.openGraph.description} />
      <meta property="og:url" content={seo.openGraph.url} />
      <meta property="og:type" content={seo.openGraph.type} />
      <meta property="og:site_name" content={seo.openGraph.siteName} />
      <meta property="og:locale" content={seo.openGraph.locale} />
      <meta property="og:image" content={seo.openGraph.image} />

      <meta name="twitter:card" content={seo.twitter.card} />
      <meta name="twitter:site" content={seo.twitter.site} />
      <meta name="twitter:title" content={seo.twitter.title} />
      <meta name="twitter:description" content={seo.twitter.description} />
      <meta name="twitter:image" content={seo.twitter.image} />
    </Head>
  );
}
