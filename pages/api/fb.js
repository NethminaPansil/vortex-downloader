import axios from 'axios';

export default async function handler(req, res) {
  // Check if the method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      result: 'Method Not Allowed. Please use POST.' 
    });
  }

  const { url } = req.body;

  // Check if URL is provided
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      result: 'URL is required. Please provide a valid TikTok link.' 
    });
  }

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

    // Handle cases where TikWM returns an error (code 0 is success)
    if (code !== 0 || !data) {
      return res.json({ 
        success: false, 
        result: msg || 'Invalid video link or video is private.' 
      });
    }

    const formatUrl = (path) => {
      if (!path) return "#";
      return path.startsWith('http') ? path : `https://www.tikwm.com${path}`;
    };

    const downloads = [
      { type: 'Video (No Watermark)', url: formatUrl(data.play) },
      { type: 'Video (Watermark)', url: formatUrl(data.wmplay) },
      { type: 'Music (MP3)', url: formatUrl(data.music) }
    ];

    // Handle image slides if available
    if (data.images && data.images.length > 0) {
      data.images.forEach((img, index) => {
        downloads.push({ type: `Slide Image ${index + 1}`, url: formatUrl(img) });
      });
    }

    // Success Response
    res.status(200).json({
      success: true,
      result: {
        title: data.title || 'Untitled Video',
        thumbnail: formatUrl(data.cover),
        author: data.author?.unique_id || 'Unknown',
        downloads: downloads
      }
    });

  } catch (e) {
    // Catch network or unexpected errors
    console.error('API Error:', e.message);
    res.status(500).json({ 
      success: false, 
      result: 'Internal Server Error. Please try again later.' 
    });
  }
}
