import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body || {};

  if (!url || !url.trim()) {
    return res.status(400).json({ error: "Instagram URL is required." });
  }

  // Instagram URL validation
  const igPattern = /https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories)\/[A-Za-z0-9_-]+/;
  if (!igPattern.test(url)) {
    return res.status(400).json({ error: "Invalid Instagram URL. Please provide a valid post, reel, or story link." });
  }

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/instagram?url=${encodeURIComponent(url.trim())}`;
    
    const { data } = await axios.get(apiUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });

    if (!data || !data.success || !data.result) {
      throw new Error("NO_MEDIA_FOUND: Could not retrieve media from Instagram.");
    }

    return res.status(200).json({
      success: true,
      result: data.result
    });

  } catch (error) {
    console.error("Instagram Downloader Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
