const axios = require('axios');
const crypto = require('node:crypto');

async function parsePost(targetUrl) {
  try {
    const [se, tst] = ['82314e32a384d00f055de496b4737acde3cbb2f851b90e1a70625f6d3bb56401', 1778140969163];

    const ins = axios.create({
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'id,id-ID;q=0.9,en-US;q=0.8,en;q=0.7',
        'origin': 'https://fastdl.app',
        'referer': 'https://fastdl.app/',
        'user-agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Chromium";v="149", "Google Chrome";v="149", "Not/A)Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site'
      }
    });

    const { data: msc } = await ins.get('https://fastdl.app/msec');
    const drift = Date.now() - Math.floor(msc.msec * 1000);
    const to = Math.abs(drift) >= 60000 ? drift : 0;
    const ts = Date.now() - to;

    const sg = crypto
      .createHmac('sha256', Buffer.from(se, 'hex'))
      .update(targetUrl + ts)
      .digest('hex');

    const { data: result } = await ins.post(
      'https://cors.caliph.my.id/https://api-wh.fastdl.app/api/convert',
      new URLSearchParams({
        sf_url: targetUrl,
        ts: ts.toString(),
        _ts: tst.toString(),
        _tsc: to.toString(),
        _sv: '2',
        _s: sg
      }).toString(),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      }
    );

    if (result.code === 'CAPTCHA_REQUIRED') {
      throw new Error('CAPTCHA_REQUIRED: Cloudflare Turnstile verification required.');
    }
    if (!result.url || result.url.length === 0) {
      throw new Error('NO_MEDIA_FOUND: Could not find media URLs.');
    }

    return {
      success: true,
      ...result
    };
  } catch (error) {
    throw new Error(`Error : ${error.message}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'Instagram URL is required.' });
  }

  // Basic Instagram URL validation
  const igPattern = /https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories)\/[A-Za-z0-9_-]+/;
  if (!igPattern.test(url)) {
    return res.status(400).json({ error: 'Invalid Instagram URL. Please provide a valid post, reel, or story link.' });
  }

  try {
    const data = await parsePost(url.trim());
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
