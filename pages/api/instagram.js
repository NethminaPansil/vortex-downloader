import axios from "axios";

const API_BASE = "https://vortex-api-theta.vercel.app/download/igdl";
const IG_REGEX =
  /https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|stories)\/[A-Za-z0-9_.-]+/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, error: "Method not allowed" });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ status: false, error: "Instagram URL is required." });
  }

  if (!IG_REGEX.test(url.trim())) {
    return res.status(400).json({
      status: false,
      error: "Invalid Instagram URL. Please provide a valid post, reel, or story link.",
    });
  }

  try {
    const { data } = await axios.get(API_BASE, {
      params: { url: url.trim() },
      timeout: 15000,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!data?.status || !data?.result?.dl_link) {
      return res.status(404).json({
        status: false,
        error: "Could not retrieve media from Instagram. Make sure the account is public.",
      });
    }

    return res.status(200).json({
      status: true,
      result: {
        type: data.result.type || "video",
        is_album: Boolean(data.result.is_album),
        filename: data.result.filename || "vortex-ig-download.mp4",
        thumbnail: data.result.thumbnail || null,
        dl_link: data.result.dl_link,
        media: data.result.media || [],
      },
    });
  } catch (error) {
    console.error("Instagram Downloader Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
}
