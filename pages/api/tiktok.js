import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false });

  const { url } = req.body;
  if (!url) return res.json({ success: false, result: 'URL is required' });

  try {
    // TikWM API එක පාවිච්චි කිරීම (මෙහි blocks ඉතා අඩුයි)
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

    if (code !== 0) {
      return res.json({ success: false, result: msg || 'Failed to fetch TikTok data' });
    }

    // අපේ UI එකට ගැලපෙන විදිහට Data සකස් කිරීම
    const downloads = [
      { type: 'Video (No Watermark)', url: `https://www.tikwm.com${data.play}` },
      { type: 'Video (Watermark)', url: `https://www.tikwm.com${data.wmplay}` },
      { type: 'Music (MP3)', url: `https://www.tikwm.com${data.music}` }
    ];

    // පින්තූර (Slideshow) එකක් නම් ඒවායේ ලින්ක් එකතු කිරීම
    if (data.images && data.images.length > 0) {
      data.images.forEach((img, index) => {
        downloads.push({ type: `Image ${index + 1}`, url: img });
      });
    }

    res.json({
      success: true,
      result: {
        title: data.title || 'TikTok Content',
        thumbnail: `https://www.tikwm.com${data.cover}`,
        downloads: downloads
      }
    });

  } catch (e) {
    console.error(e);
    res.json({ success: false, result: "Network Error: Please try again later" });
  }
}
