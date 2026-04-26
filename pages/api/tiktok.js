import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  const { url } = req.body;
  if (!url) return res.json({ success: false, result: 'URL is required' });

  try {
    const response = await axios.post('https://www.tikwm.com/api/', 
      new URLSearchParams({ url: url }).toString(), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        }
      }
    );

    const { code, data, msg } = response.data;

    if (code !== 0 || !data) {
      return res.json({ success: false, result: msg || 'Failed to fetch TikTok data' });
    }

    // ලින්ක් එකේ https කෑල්ල දෙපාරක් එන එක වැළැක්වීමට මෙහෙම කරමු:
    const formatUrl = (path) => {
      if (!path) return "#";
      // සමහර වෙලාවට TikWM කෙලින්ම full URL එකක් දෙනවා, සමහරවිට path එකක් විතරක් දෙනවා
      return path.startsWith('http') ? path : `https://www.tikwm.com${path}`;
    };

    const downloads = [
      { type: 'Video (No Watermark)', url: formatUrl(data.play) },
      { type: 'Video (Watermark)', url: formatUrl(data.wmplay) },
      { type: 'Music (MP3)', url: formatUrl(data.music) }
    ];

    if (data.images && data.images.length > 0) {
      data.images.forEach((img, index) => {
        downloads.push({ type: `Image ${index + 1}`, url: formatUrl(img) });
      });
    }

    res.json({
      success: true,
      result: {
        title: data.title || 'TikTok Content',
        thumbnail: formatUrl(data.cover),
        downloads: downloads
      }
    });

  } catch (e) {
    res.json({ success: false, result: "Network Error: Link issue fixed, please retry" });
  }
}
