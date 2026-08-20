export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ status: false, msg: "Method not allowed" });

  try {
    const { url, format, type } = req.body;
    const id = url?.match(YT_REGEX)?.[1];

    if (!id) throw new Error("Invalid YouTube URL");

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

    const isAudio = format === "mp3";
    const data = await fetchYtInfo(url, isAudio ? "aud" : "vid");
    if (!data?.links) throw new Error("Download link generation failed");

    const firstKey = Object.keys(data.links)[0];
    const rawLink = data.links[firstKey];

    // rawLink එකේ ඇතුළෙ තියෙන real CDN url එක extract කරගන්නවා
    const inner = new URL(rawLink);
    const actualUrl = inner.searchParams.get("url");

    if (!actualUrl) throw new Error("Download link generation failed");

    res.json({
      status: true,
      dl: actualUrl,
      format: format,
    });
  } catch (e) {
    console.error(e);
    res.json({ status: false, error: e.message });
  }
}
