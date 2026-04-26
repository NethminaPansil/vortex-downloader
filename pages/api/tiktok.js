import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  const { url } = req.body;
  if (!url) return res.json({ success: false, result: 'URL is required' });

  try {
    const response = await axios.post('https://tikdownloader.io/api/ajaxSearch', 
      new URLSearchParams({ q: url }).toString(), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://tikdownloader.io/'
        }
      }
    );

    const { status, data, msg } = response.data;
    if (status !== 'ok') return res.json({ success: false, result: msg || 'Failed to fetch TikTok data' });

    const html = data;
    const $ = s => (html.match(s) || [])[1]?.trim();
    
    const downloads = [...html.matchAll(/href="([^"]+)"[^>]*tik-button-dl[^>]*>([\s\S]*?)<\/a>/g)].map(m => ({ 
      type: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), 
      url: m[1] 
    }));

    if (!downloads.length) return res.json({ success: false, result: 'No download links found' });

    res.json({
      success: true,
      result: {
        title: $(/<h3[^>]*>([^<]+)<\/h3>/) || 'TikTok Content',
        thumbnail: $(/<img[^>]+src="([^"]+)"[^>]*class="[^"]*image-tik[^"]*"/),
        downloads
      }
    });

  } catch (e) {
    res.json({ success: false, result: "Request Blocked by Server" });
  }
}
