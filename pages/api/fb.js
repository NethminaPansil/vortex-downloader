import axios from "axios";

const API_BASE = "https://vortex-api-theta.vercel.app/download/fbdl";
const FB_REGEX =
  /https?:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.watch|fb\.com)\/[^\s]+/i;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, error: "Method not allowed" });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ status: false, error: "Facebook URL is required." });
  }

  if (!FB_REGEX.test(url.trim())) {
    return res.status(400).json({
      status: false,
      error: "Invalid Facebook URL. Please provide a valid video, reel, or watch link.",
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

    const r = data?.result;
    if (!data?.status || !r || (!r.dl_link && !r.links?.length)) {
      return res.status(404).json({
        status: false,
        error: "Could not retrieve Facebook video. Make sure the post is public.",
      });
    }

    // Thumbnail URL එකේ ඇති &amp; entities නිවැරදි කිරීම
    const cleanThumbnail = r.thumbnail
      ? r.thumbnail.replace(/&amp;/g, "&")
      : null;

    // Quality options සකසා ගැනීම (HD / SD)
    const options = Array.isArray(r.links) && r.links.length > 0
      ? r.links.map((item) => ({
          label: item.quality || "Download Video",
          format: "mp4",
          dl: item.url,
        }))
      : [
          ...(r.hd ? [{ label: "720p (HD)", format: "mp4", dl: r.hd }] : []),
          ...(r.sd ? [{ label: "360p (SD)", format: "mp4", dl: r.sd }] : []),
          ...(r.dl_link && !r.hd && !r.sd
            ? [{ label: r.quality || "Download Video", format: "mp4", dl: r.dl_link }]
            : []),
        ];

    return res.status(200).json({
      status: true,
      result: {
        title: r.title || "Facebook Video",
        duration: r.duration || null,
        thumbnail: cleanThumbnail,
        options,
      },
    });
  } catch (error) {
    console.error("Facebook Downloader Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
}
