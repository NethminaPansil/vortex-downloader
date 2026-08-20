import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, msg: "Method not allowed" });
  }

  try {
    const { url, format, type } = req.body || {};

    if (!url) {
      return res.status(400).json({ status: false, error: "URL is required" });
    }

    // YouTube URL එක නිවැරදිදැයි පරීක්ෂා කිරීම
    const youtubeRegex = /(?:youtu\.be\/|youtube\.com.*v=)([a-zA-Z0-9_-]{11})/;
    const videoId = url.match(youtubeRegex)?.[1];

    if (!videoId) {
      return res.status(400).json({ status: false, error: "Invalid YouTube URL" });
    }

    // format එක mp3 නම් 'aud' (Audio), නැත්නම් 'vid' (Video) ලෙස සකසයි
    const isAudio = format === "mp3";
    const apiType = isAudio ? "aud" : "vid";

    // නව API එකට Request එක යැවීම
    const response = await axios.get(
      `https://ytdl.udmodzz.workers.dev/?url=${encodeURIComponent(url)}&type=${apiType}`
    );
    const data = response.data;

    if (!data || !data.links) {
      throw new Error("Failed to fetch download link from API");
    }

    // පියවර 1: Frontend එකෙන් ඉල්ලන්නේ තොරතුරු විතරක් නම් (Analyze mode)
    if (type === "info") {
      return res.json({
        status: true,
        data: {
          title: data.videoname,
          thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          description: data.desc
        }
      });
    }

    // පියවර 2: Download Link එක ලබා ගැනීම (Quality / Download button එකක් එබූ විට)
    // links Object එකේ ඇති පළමු Link එක ලබා ගනී (e.g., "HD Video" හෝ "128kbps")
    const downloadUrl = Object.values(data.links)[0];

    if (downloadUrl) {
      return res.json({
        status: true,
        dl: downloadUrl,
        format: format || (isAudio ? "mp3" : "mp4")
      });
    } else {
      throw new Error("Download link generation failed");
    }

  } catch (e) {
    console.error("API Error:", e.message);
    return res.status(500).json({ status: false, error: e.message });
  }
}
