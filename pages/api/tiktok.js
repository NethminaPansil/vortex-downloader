import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  const { url } = req.body;
  
  try {
    const response = await axios.post('https://tikdownloader.io/api/ajaxSearch', 
      `q=${encodeURIComponent(url)}`, 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://tikdownloader.io',
          'Referer': 'https://tikdownloader.io/'
        }
      }
    );

    const data = response.data;
    if (data.status !== 'ok') throw new Error(data.msg || 'Gagal');

    const html = data.data;
    const $ = s => (html.match(s) || [])[1]?.trim();

    // HTML Entities Decode කිරීම
    const cleanHtml = html.replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    const downloads = [...cleanHtml.matchAll(/href="([^"]+)"[^>]*tik-button-dl[^>]*>([\s\S]*?)<\/a>/g)].map(m => ({ 
      type: m[2].replace(/<[^>]+>/g, '').trim(), 
      url: m[1] 
    }));

    // TikTok Thumbnail proxy හරහා යැවීම (Referer block එක මඟහැරීමට)
    const rawThumb = $(/src="([^"]+)"/);

    res.json({
      success: true,
      result: {
        title: $(/<h3>([^<]+)<\/h3>/) || 'TikTok Video',
        thumbnail: rawThumb,
        downloads: downloads
      }
    });

  } catch (e) {
    res.status(200).json({ success: false, result: e.message });
  }
}
