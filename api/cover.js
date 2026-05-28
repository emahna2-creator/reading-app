export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('url parameter required', { status: 400 });
  }

  // Amazonのドメインのみ許可
  const allowed = [
    'images-na.ssl-images-amazon.com',
    'm.media-amazon.com',
    'images.amazon.com',
  ];
  const hostname = new URL(url).hostname;
  if (!allowed.some(d => hostname.includes(d))) {
    return new Response('Domain not allowed', { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.amazon.co.jp/',
      },
    });

    if (!res.ok) {
      return new Response('Failed to fetch image', { status: res.status });
    }

    const blob = await res.blob();
    return new Response(blob, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
}
