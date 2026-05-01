// Vercel Serverless Proxy — Apps Script CORS 우회
// 서버→서버 호출이므로 CORS 제약 없음

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWH7qRi95fK50qCaDrE7b4IiVE-QZUozE_-bDKVgv1WM_uYAkQDBF4xrsWqzu5kkg/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Apps Script responded with ' + response.status,
        statusText: response.statusText
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();

    if (contentType.includes('application/json') || body.startsWith('{') || body.startsWith('[')) {
      try {
        const data = JSON.parse(body);
        return res.status(200).json(data);
      } catch(e) {
        return res.status(200).send(body);
      }
    }

    return res.status(403).json({
      error: 'Apps Script requires authentication',
      hint: 'Apps Script > 배포 관리 > 액세스: 모든 사용자로 변경 필요'
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Proxy fetch failed',
      message: err.message
    });
  }
                                 }
