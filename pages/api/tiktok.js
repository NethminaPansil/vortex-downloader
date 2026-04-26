import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  const { url } = req.body;
  if (!url) return res.json({ success: false, result: 'URL එක ඇතුළත් කරන්න' });

  try {
    // tikdownloader.io එකට request එක යවනවා
    const response = await axios.post('https://tikdownloader.io/api/ajaxSearch', 
      new URLSearchParams({ q: url }).toString(), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://tikdownloader.io',
          'Referer': 'https://tikdownloader.io/'
        }
      }
    );

    const { status, data, msg } = response.data;
    if (status !== 'ok' || !data) return res.json({ success: false, result: msg || 'Gagal ambil data' });

    // ඔයාගේ scraper එකේ තිබුණ HTML Entity decode logic එක
    let html = data.replace(/&(?:amp|lt|gt|quot|#x27|#39|#x2F|nbsp|#xA0|#160|#(\d+)|#x([0-9a-fA-F]+));/gi, 
      (_, dec, hex) => dec ? String.fromCharCode(dec) : hex ? String.fromCharCode(parseInt(hex, 16)) : 
      { '&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#x27;':"'",'&#39;':"'",'&#x2F;':'/','&nbsp;':' ','&#xA0;':' ','&#160;':' ' }[_] || _);

    const $ = s => (html.match(s) || [])[1]?.trim();
    const isPhoto = html.includes('photo-list');
    
    // ඔයාගේ scraper එකේ තිබුණ Downloads extract කරන logic එක
    let downloads = isPhoto 
      ? [...html.matchAll(/href="([^"]+)"[^>]*btn-premium[^>]*>[\s\S]*?Download Image/g)].map((m, i) => ({ type: `Image ${i+1}`, url: m[1] }))
          .concat((html.match(/href="([^"]+dl\.snapcdn\.app[^"]+)".*?Download MP3/) || []).slice(1).map(u => ({ type: 'MP3', url: u })))
      : [...html.matchAll(/href="([^"]+)"[^>]*tik-button-dl[^>]*>([\s\S]*?)<\/a>/g)].map(m => ({ 
          type: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), 
          url: m[1] 
        }));

    if (!downloads.length) return res.json({ success: false, result: 'Download links හමු වුනේ නැත' });

    // Result එක Frontend එකට යවනවා
    res.json({
      success: true,
      result: {
        type: isPhoto ? 'photo' : 'video',
        title: $(/<h3[^>]*>([^<]+)<\/h3>/) || 'TikTok Content',
        thumbnail: $(/<img[^>]+src="([^"]+)"[^>]*(?:class="[^"]*image-tik[^"]*"|)/),
        downloads: downloads
      }
    });

  } catch (e) {
    console.error(e);
    res.json({ success: false, result: "Cloudflare Block: Vercel IP block කර ඇත. කරුණාකර නැවත උත්සාහ කරන්න." });
  }
}
