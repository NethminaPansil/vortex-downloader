const axios = require('axios');
const cheerio = require('cheerio');

const config = {
  apiUrl: 'https://ssstik.io/abc',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'HX-Request': 'true',
    'HX-Trigger': '_gcaptcha_pt',
    'HX-Target': 'target',
    'HX-Current-URL': 'https://ssstik.io/',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://ssstik.io',
    'Referer': 'https://ssstik.io/'
  }
};

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function downloadTikTok(url) {
  const params = new URLSearchParams();
  params.append('id', url);
  params.append('locale', 'en');
  params.append('tt', generateToken());
  params.append('debug', 'ab=0&loc=ID&ip=103.189.201.195');

  const response = await axios.post(config.apiUrl + '?url=dl', params.toString(), {
    headers: config.headers,
    timeout: 30000,
    maxRedirects: 5
  });

  const $ = cheerio.load(response.data);

  const result = {
    success: false,
    original_url: url,
    author: $('.result_author').attr('alt') || '',
    title: $('h2').text().trim() || '',
    description: $('.maintext').text().trim() || '',
    stats: { likes: '0', comments: '0', shares: '0' },
    downloads: [],
    thumbnail: null
  };

  // Stats
  $('.trending-actions .d-flex').each((index, element) => {
    const text = $(element).find('div:last-child').text().trim();
    if (index === 0) result.stats.likes = text;
    else if (index === 1) result.stats.comments = text;
    else if (index === 2) result.stats.shares = text;
  });

  // Download links
  $('a.download_link').each((_, element) => {
    const href = $(element).attr('href');
    const text = $(element).text().trim();
    const classes = $(element).attr('class') || '';

    if (href && !href.startsWith('#')) {
      let type = 'video';
      let quality = 'sd';
      let watermark = 'with';

      if (classes.includes('music')) type = 'audio';
      if (classes.includes('without_watermark')) watermark = 'without';
      if (classes.includes('quality-best') || classes.includes('hd')) quality = 'hd';

      result.downloads.push({ type, quality, watermark, label: text, url: href });
    }
  });

  // HD direct URL
  const hdBtn = $('#hd_download');
  if (hdBtn.length > 0 && hdBtn.attr('data-directurl')) {
    result.hd_direct_url = hdBtn.attr('data-directurl');
  }

  // Thumbnail
  const bgStyle = $('style').filter((_, el) => $(el).html().includes('background-image')).html() || '';
  const bgMatch = bgStyle.match(/background-image:\s*url\(([^)]+)\)/);
  if (bgMatch) result.thumbnail = bgMatch[1];

  if (result.downloads.length > 0) {
    result.success = true;
  } else {
    result.error = 'No download links found. Video may be private or unavailable.';
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'TikTok URL is required.' });
  }

  if (!url.includes('tiktok.com')) {
    return res.status(400).json({ error: 'Invalid TikTok URL. Please provide a valid TikTok link.' });
  }

  try {
    const data = await downloadTikTok(url.trim());
    if (!data.success) {
      return res.status(500).json({ error: data.error || 'Failed to fetch TikTok media.' });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
