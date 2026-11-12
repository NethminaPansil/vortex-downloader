import axios from "axios";

const API_BASE = "https://vortex-api-theta.vercel.app/download";
const YT_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;

const ALLOWED_QUALITIES = ["1080", "720", "480", "360"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, error: "Method not allowed" });
  }

  try {
    const { url, format = "mp4", quality = "720", type } = req.body || {};
    const id = typeof url === "string" ? url.match(YT_REGEX)?.[1] : null;

    if (!id) {
      return res.status(400).json({ status: false, error: "Invalid YouTube URL" });
    }

    // පියවර 1: වීඩියෝ විස්තර සහ Quality options ලබා ගැනීම (Analyze Link එබූ විට)
    if (type === "info") {
      const { data } = await axios.get(`${API_BASE}/ytmp3`, {
        params: { url },
        timeout: 15000,
      });

      if (!data?.status || !data?.result) {
        return res.status(404).json({ status: false, error: "Video info not found" });
      }

      return res.status(200).json({
        status: true,
        data: {
          title: data.result.title || "YouTube Video",
          thumbnail: data.result.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          qualities: [
            { label: "1080p Full HD (MP4)", format: "mp4", quality: "1080" },
            { label: "720p HD (MP4)", format: "mp4", quality: "720" },
            { label: "480p SD (MP4)", format: "mp4", quality: "480" },
            { label: "360p (MP4)", format: "mp4", quality: "360" },
            { label: "MP3 Audio (128kbps)", format: "mp3", quality: "128" },
          ],
        },
      });
    }

    // පියවර 2: තෝරාගත් Format සහ Quality එකට අදාළ Download Link එක ලබා ගැනීම
    const isAudio = format === "mp3";
    const endpoint = isAudio ? `${API_BASE}/ytmp3` : `${API_BASE}/ytmp4`;

    // "720p" ලෙස පැමිණියහොත් "p" අකුර ඉවත් කර "720" ලෙස සකසා ගැනීම
    const cleanQuality = String(quality).replace(/p$/i, "");
    const selectedQuality = ALLOWED_QUALITIES.includes(cleanQuality) ? cleanQuality : "720";

    const params = isAudio ? { url } : { url, quality: selectedQuality };

    const { data } = await axios.get(endpoint, {
      params,
      timeout: 20000,
    });

    const downloadUrl = data?.result?.dl_link;

    if (!data?.status || !downloadUrl) {
      return res.status(502).json({ status: false, error: "Download link generation failed" });
    }

    // CDN hotlink / 400 error මඟහරවා ගැනීමට proxy endpoint එක හරහා යැවීම
    const ext = isAudio ? "mp3" : "mp4";
    const safeTitle = (data.result.title || "vortex-download")
      .replace(/[\\/:*?"<>|]/g, "")
      .trim()
      .slice(0, 60);

    const proxyUrl = `/api/ytproxy?url=${encodeURIComponent(
      downloadUrl
    )}&ext=${ext}&title=${encodeURIComponent(safeTitle)}`;

    return res.status(200).json({
      status: true,
      dl: proxyUrl,
      format,
      quality: isAudio ? "128kbps" : `${selectedQuality}p`,
    });
  } catch (e) {
    console.error("YT API Error:", e.message);
    return res.status(500).json({
      status: false,
      error: e.response?.data?.message || e.message || "Internal server error",
    });
  }
}
