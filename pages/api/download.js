const axios = require("axios");

const BASE = "https://ytdl.udmodzz.workers.dev/";
const YT_REGEX = /(?:youtu\.be\/|youtube\.com.*v=)([a-zA-Z0-9_-]{11})/;

async function fetchYtInfo(url, type) {
  const res = await axios.get(BASE, {
    params: { url, type },
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    },
  });
  return res.data;
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ status: false, msg: "Method not allowed" });

  try {
    const { url, format, type } = req.body;
    const id = url?.match(YT_REGEX)?.[1];

    if (!id) throw new Error("Invalid YouTube URL");

    // පියවර 1: වීඩියෝ විස්තර ලබා ගැනීම (Analyze Link එබූ විට)
    if (type === "info") {
      const data = await fetchYtInfo(url, "vid");

      if (!data?.links) throw new Error("Video info not found");

      return res.json({
        status: true,
        data: {
          title: data.videoname,
          thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        },
      });
    }

    // පියවර 2: Download Link එක ලබා ගැනීම (Quality Button එකක් එබූ විට)
    const isAudio = format === "mp3";
    const data = await fetchYtInfo(url, isAudio ? "aud" : "vid");

    if (!data?.links) throw new Error("Download link generation failed");

    // API එකෙන් ලැබෙන links object එකේ පළමු key එකේ අගය ගන්නවා
    // (mp3 → "128kbps", video → "HD Video")
    const firstKey = Object.keys(data.links)[0];
    const downloadUrl = data.links[firstKey];

    if (!downloadUrl) throw new Error("Download link generation failed");

    res.json({
      status: true,
      dl: downloadUrl,
      format: format,
    });
  } catch (e) {
    console.error(e);
    res.json({ status: false, error: e.message });
  }
}
