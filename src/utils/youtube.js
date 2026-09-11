export function getYoutubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;

  const normalized = url.trim();

  let videoId = null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }

  if (!videoId) return null;

  let embedUrl = `https://www.youtube.com/embed/${videoId}`;

  // Extract timestamp parameter (t=SECONDS) from original URL
  const timeMatch = normalized.match(/[?&]t=(\d+)/);
  if (timeMatch && timeMatch[1]) {
    embedUrl += `?start=${timeMatch[1]}`;
  }

  return embedUrl;
}
