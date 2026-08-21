const axios = require("axios");

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ status: false, msg: "Method not allowed" });

  try {
    const { url, ext, title } = req.query;
    if (!url) throw new Error("Missing url");

    const fileName = `${(title || "vortex-download").toString()}.${ext === "mp3" ? "mp3" : "mp4"}`;

    // CDN එකට request කරන්නෙ ම්‍යූඡික් worker එකෙන්ම එනවා වගේ Referer/UA එකක් එක්කයි,
    // ඒ නිසා hotlink/referrer check එකෙන් 400 එකක් එන්නෙ නෑ.
    const upstream = await axios.get(url, {
      responseType: "stream",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        referer: "https://ytdl.udmodzz.workers.dev/",
        origin: "https://ytdl.udmodzz.workers.dev",
      },
      validateStatus: () => true,
    });

    if (upstream.status < 200 || upstream.status >= 300) {
      res.status(502).json({
        status: false,
        error: `Upstream file server returned ${upstream.status}`,
      });
      return;
    }

    res.setHeader(
      "Content-Type",
      ext === "mp3" ? "audio/mpeg" : "video/mp4"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName.replace(/"/g, "")}"`
    );
    if (upstream.headers["content-length"]) {
      res.setHeader("Content-Length", upstream.headers["content-length"]);
    }

    upstream.data.pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, error: e.message });
  }
}
