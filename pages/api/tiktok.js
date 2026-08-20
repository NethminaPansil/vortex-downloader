import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};

  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'TikTok URL is required.' });
  }

  // Basic TikTok URL validation (supports tiktok.com, vm.tiktok.com, vt.tiktok.com)
  const tiktokPattern = /https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/.+/i;
  if (!tiktokPattern.test(url.trim())) {
    return res.status(400).json({ error: 'Invalid TikTok URL. Please provide a valid TikTok link.' });
  }

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/download/aiov2?url=${encodeURIComponent(url.trim())}`;

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const { status, result } = response.data || {};

    if (!status || !result || result.length === 0) {
      return res.status(400).json({ error: 'Failed to fetch TikTok media or video unavailable.' });
    }

    const mediaData = result[0];

    return res.status(200).json({
      success: true,
      original_url: url.trim(),
      title: mediaData.title || 'TikTok Video',
      thumbnail: mediaData.thumbnail || mediaData.video_preview || null,
      downloads: [
        {
          type: 'video',
          quality: 'hd',
          watermark: 'without',
          label: 'Download Video',
          url: mediaData.video_download
        }
      ]
    });

  } catch (error) {
    console.error('TikTok API Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
