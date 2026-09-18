# Fase 1 de SEO — Bohurt Argentina

## Objetivo
Implementar las bases de SEO on-page para mejorar la indexación en buscadores y la apariencia de los enlaces compartidos en redes sociales.

---

## Archivos nuevos

### `src/utils/seo.js`
Helper reutilizable que genera:
- `<title>`
- `<meta name="description">`
- `<meta name="robots">`
- `<link rel="canonical">`
- Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`, `og:locale`, `og:image`)
- Twitter Card tags (`twitter:card`, `twitter:site`, `twitter:title`, `twitter:description`, `twitter:image`)

Valores por defecto:
- Título: `Bohurt Argentina | Combate Medieval Histórico en Argentina`
- Descripción: descripción general del sitio.
- Imagen OG: `https://bohurtargentina.vercel.app/shield.png`
- URL base: `https://bohurtargentina.vercel.app`

### `src/components/common/SeoHead.jsx`
Componente que renderiza todos los meta tags usando `next/head`. Se usa en cada página pública.

### `public/robots.txt`
Permite el rastreo de todo el sitio excepto `/admin/` y `/login`. Apunta al sitemap.

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login

Sitemap: https://bohurtargentina.vercel.app/sitemap.xml
```

### `public/sitemap.xml`
Sitemap estático con las páginas principales del sitio:
- `/`
- `/bohurt`
- `/donde-entrenar`
- `/clubs`
- `/tournaments`
- `/news`
- `/contacto`

### `public/googlec48fe0ab13ca55cb.html`
Archivo de verificación de Google Search Console.

---

## Archivos modificados

### `src/pages/_document.jsx`
- Se quitó el atributo `integrity` del CDN de Font Awesome porque fallaba y generaba error en consola.

### `src/pages/_app.jsx`
- Se agregó `useRouter`.
- Se agregaron meta tags globales:
  - `viewport`
  - `theme-color`
  - Favicon (`/shield.png`)
  - Apple touch icon (`/shield.png`)
- Se agregó lógica para inyectar `<meta name="robots" content="noindex, nofollow" />` en rutas `/admin/*` y `/login`.

### Páginas públicas con SEO aplicado

| Página | Title | Description |
|---|---|---|
| `/` | Bohurt Argentina \| Combate Medieval Histórico en Argentina | Descripción general del sitio. |
| `/bohurt` | ¿Qué es el Bohurt? \| Bohurt Argentina | Explica qué es el Bohurt y sus reglas. |
| `/donde-entrenar` | ¿Dónde puedo entrenar? \| Bohurt Argentina | Mapa de clubes por provincia. |
| `/clubs` | Clubes \| Bohurt Argentina | Listado de clubes. |
| `/clubs/[nombre]` | `<Nombre del club>` \| Bohurt Argentina | Info del club. |
| `/clubs/clubInfo/[clubId]` | `<Nombre del club>` \| Bohurt Argentina | Info básica del club. |
| `/team/[nombre]` | `<Nombre del equipo>` \| Bohurt Argentina | Perfil del equipo. |
| `/tournaments` | Torneos \| Bohurt Argentina | Listado de torneos. |
| `/tournaments/[tournamentId]` | `<Nombre del torneo>` \| Bohurt Argentina | Detalle del torneo. |
| `/tournaments/[tournamentId]/teams/[teamId]` | `<Equipo> \| <Torneo>` \| Bohurt Argentina | Equipo dentro de un torneo. |
| `/news` | Noticias \| Bohurt Argentina | Listado de noticias. |
| `/news/[id]` | `<Título de la noticia>` \| Bohurt Argentina | Noticia individual. |
| `/peleadores/[id]` | `<Nombre> <Apellido>` \| Bohurt Argentina | Perfil del peleador. |
| `/contacto` | Contacto \| Bohurt Argentina | Información de contacto. |

### Páginas con `noindex`

- `/login`
- `/admin/*` (todas las páginas de administración)
- `/organizers/[organizerId]` (placeholder)
- `/tournaments/[tournamentId]/manage` (placeholder)

---

## Pendientes para Fase 2

1. **Sitemap dinámico**
   - Generar `sitemap.xml` desde la API incluyendo cada club, equipo, torneo, noticia y peleador.

2. **Datos estructurados (JSON-LD)**
   - `SportsOrganization` para la home.
   - `SportsTeam` para clubes y equipos.
   - `SportsEvent` para torneos.

3. **Imagen Open Graph optimizada**
   - Crear una imagen de 1200x630 px para reemplazar `/shield.png`.

4. **Optimización de performance**
   - Reducir peso del mapa SVG.
   - Revisar Largest Contentful Paint (LCP) y Cumulative Layout Shift (CLS).

5. **Google Search Console**
   - Verificar propiedad.
   - Subir sitemap.
   - Revisar indexación.

6. **Estrategia de contenido**
   - Blog/noticias regulares con keywords relevantes.

---

## Cómo probar

1. Correr `npm run build` sin errores.
2. En desarrollo (`npm run dev`), inspeccionar el `<head>` de cada página y verificar:
   - Title correcto.
   - Meta description presente.
   - Canonical URL correcta.
   - OG tags presentes.
3. Validar `robots.txt` en `https://bohurtargentina.vercel.app/robots.txt`.
4. Validar `sitemap.xml` en `https://bohurtargentina.vercel.app/sitemap.xml`.
5. Verificar que las páginas `/login` y `/admin/*` tengan `noindex`.
