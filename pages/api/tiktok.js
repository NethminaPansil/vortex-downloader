import axios from "axios";

const API_BASE = "https://vortex-api-theta.vercel.app/download/tiktokdl";
const TIKTOK_REGEX =
  /https?:\/\/((?:vm|vt|www|m)\.)?tiktok\.com\/[^\s]+/i;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, error: "Method not allowed" });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ status: false, error: "TikTok URL is required." });
  }

  if (!TIKTOK_REGEX.test(url.trim())) {
    return res.status(400).json({
      status: false,
      error: "Invalid TikTok URL. Please provide a valid TikTok video or photo link.",
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
    if (!data?.status || !r) {
      return res.status(404).json({
        status: false,
        error: "Could not fetch TikTok media. Make sure the video is public.",
      });
    }

    const safeTitle = (r.title || `tiktok-${r.id || "video"}`)
      .replace(/[\\/:*?"<>|\r\n]/g, "")
      .trim()
      .slice(0, 60) || "vortex-tiktok";

    // Proxy හරහා Direct Download වෙන විදියට links සකසා ගැනීම
    const makeProxy = (rawUrl, ext, labelSuffix) =>
      rawUrl
        ? `/api/ytproxy?url=${encodeURIComponent(rawUrl)}&ext=${ext}&title=${encodeURIComponent(
            `${safeTitle}-${labelSuffix}`
          )}`
        : null;

    const options = [];

    if (!r.is_slide) {
      if (r.video_hd || r.dl_link) {
        options.push({
          label: "HD Video (No Watermark)",
          format: "mp4",
          dl: makeProxy(r.video_hd || r.dl_link, "mp4", "HD"),
        });
      }
      if (r.video && r.video !== r.video_hd) {
        options.push({
          label: "Standard Video (No Watermark)",
          format: "mp4",
          dl: makeProxy(r.video, "mp4", "SD"),
        });
      }
      if (r.video_wm) {
        options.push({
          label: "Video (With Watermark)",
          format: "mp4",
          dl: makeProxy(r.video_wm, "mp4", "WM"),
        });
      }
    }

    if (r.music) {
      options.push({
        label: "MP3 Audio Only",
        format: "mp3",
        dl: makeProxy(r.music, "mp3", "audio"),
      });
    }

    return res.status(200).json({
      status: true,
      result: {
        id: r.id,
        title: r.title || "TikTok Video",
        author: {
          nickname: r.author?.nickname || r.uploader || "TikTok User",
          unique_id: r.author?.unique_id || "",
          avatar: r.author?.avatar || null,
        },
        duration: r.duration || "00:00",
        thumbnail: r.thumbnail || null,
        is_slide: Boolean(r.is_slide),
        images: r.images || [],
        stats: r.stats || {},
        options,
      },
    });
  } catch (error) {
    console.error("TikTok Downloader Error:", error.message);
    return res.status(500).json({
      status: false,
      error: error.response?.data?.message || error.message || "Internal server error",
    });
  }
}
