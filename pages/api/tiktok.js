// pages/api/tiktok.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { url } = req.body;
  if (!url) return res.json({ success: false, result: 'URL එක ඇතුළත් කරන්න' });

  try {
    // සටහන: cloudscraper වෙනුවට සාමාන්‍ය axios පාවිච්චි කර බලමු. 
    // tikdownloader.io සමහර වෙලාවට Cloudflare protection දානවා.
    const response = await axios.post('https://tikdownloader.io/api/ajaxSearch', 
      new URLSearchParams({ q: url }), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    const { status, data, msg } = response.data;
    if (status !== 'ok') return res.json({ success: false, result: msg || 'Gagal ambil data' });

    // HTML decode logic (ඔයාගේ scraper එකේ තිබුණ එකමයි)
    const html = data;
    const $ = s => (html.match(s) || [])[1]?.trim();
    
    // Download links ටික Extract කිරීම
    const downloads = [...html.matchAll(/href="([^"]+)"[^>]*tik-button-dl[^>]*>([\s\S]*?)<\/a>/g)].map(m => ({ 
      type: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), 
      url: m[1] 
    }));

    if (!downloads.length) return res.json({ success: false, result: 'Download links හමු වුනේ නැත' });

    res.json({
      success: true,
      result: {
        title: $(/<h3[^>]*>([^<]+)<\/h3>/) || 'TikTok Video',
        thumbnail: $(/<img[^>]+src="([^"]+)"[^>]*class="[^"]*image-tik[^"]*"/),
        downloads
      }
    });

  } catch (e) {
    res.json({ success: false, result: e.message });
  }
}
