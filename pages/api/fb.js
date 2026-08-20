import axios from 'axios';

export default async function handler(req, res) {
  // Check if the method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      result: 'Method Not Allowed. Please use POST.' 
    });
  }

  const { url } = req.body || {};

  // Check if URL is provided
  if (!url || !url.trim()) {
    return res.status(400).json({ 
      success: false, 
      result: 'URL is required. Please provide a valid Facebook link.' 
    });
  }

  // Basic Facebook URL validation
  const fbPattern = /https?:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.watch)\/.+/i;
  if (!fbPattern.test(url.trim())) {
    return res.status(400).json({ 
      success: false, 
      result: 'Invalid Facebook URL. Please provide a valid video link.' 
    });
  }

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/facebook?url=${encodeURIComponent(url.trim())}`;

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });

    const { success, result } = response.data || {};

    if (!success || !result) {
      return res.status(400).json({ 
        success: false, 
        result: 'Invalid video link or video is private.' 
      });
    }

    const downloads = [];

    // Extract HD & SD links from API response
    if (result.downloads?.hd?.url) {
      downloads.push({ 
        type: 'Video (HD)', 
        url: result.downloads.hd.url 
      });
    }

    if (result.downloads?.sd?.url) {
      downloads.push({ 
        type: 'Video (SD)', 
        url: result.downloads.sd.url 
      });
    }

    if (downloads.length === 0) {
      return res.status(400).json({ 
        success: false, 
        result: 'Could not find media download URLs.' 
      });
    }

    // Success Response
    return res.status(200).json({
      success: true,
      result: {
        title: result.title ? result.title.replace(/\r\n/g, ' ').trim() : 'Facebook Video',
        downloads: downloads
      }
    });

  } catch (e) {
    console.error('API Error:', e.message);
    return res.status(500).json({ 
      success: false, 
      result: 'Internal Server Error. Please try again later.' 
    });
  }
}
