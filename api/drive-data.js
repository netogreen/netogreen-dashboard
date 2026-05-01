// Vercel Serverless Proxy — Apps Script CORS 우회
// 서버→서버 호출이므로 CORS 제약 없음

const APPS_SCRIPT_URL = 'https://script.google.com/a/macros/netogreenkr.com/s/AKfycbyWH7qRi95fK50qCaDrE7b4IiVE-QZUozE_-bDKVgv1WM_uYAkQDBF4xrsWqzu5kkg/exec';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Follow redirects to get the actual content URL
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; Vercel Serverless)'
      }
    });

    const body = await response.text();

    // Check if we got JSON data
    if (body.startsWith('{') || body.startsWith('[')) {
      try {
        const data = JSON.parse(body);
        return res.status(200).json(data);
      } catch(e) {
        return res.status(200).send(body);
      }
    }

    // If HTML response, try the non-workspace URL format
    const altUrl = 'https://script.google.com/macros/s/AKfycbyWH7qRi95fK50qCaDrE7b4IiVE-QZUozE_-bDKVgv1WM_uYAkQDBF4xrsWqzu5kkg/exec';
    const altResp = await fetch(altUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; Vercel Serverless)'
      }
    });

    const altBody = await altResp.text();

    if (altBody.startsWith('{') || altBody.startsWith('[')) {
      try {
        const data = JSON.parse(altBody);
        return res.status(200).json(data);
      } catch(e) {
        return res.status(200).send(altBody);
      }
    }

    return res.status(403).json({
      error: 'Apps Script requires authentication',
      hint: 'Apps Script 배포 > 액세스: 모든 사용자(로그인 불필요)로 변경 필요',
      responseLength: body.length,
      altResponseLength: altBody.length
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Proxy fetch failed',
      message: err.message
    });
  }
}
