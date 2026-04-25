const axios = require("axios");
const crypto = require("crypto");

class SaveTube {
  constructor() {
    this.ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
    this.m = /(?:youtu\.be\/|youtube\.com.*v=)([a-zA-Z0-9_-]{11})/;

    this.is = axios.create({
      headers: {
        "content-type": "application/json",
        "origin": "https://yt.savetube.me",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });
  }

  async decrypt(enc) {
    try {
      const sr = Buffer.from(enc, "base64");
      const ky = Buffer.from(this.ky, "hex");
      const iv = sr.slice(0, 16);
      const dt = sr.slice(16);

      const dc = crypto.createDecipheriv("aes-128-cbc", ky, iv);
      return JSON.parse(Buffer.concat([dc.update(dt), dc.final()]).toString());
    } catch (e) {
      throw new Error("Decryption failed");
    }
  }

  async getCdn() {
    const res = await this.is.get("https://media.savetube.vip/api/random-cdn");
    return res.data.cdn;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ status: false, msg: "Method not allowed" });

  try {
    const { url, format, type } = req.body;
    const st = new SaveTube();
    const id = url.match(st.m)?.[1];

    if (!id) throw new Error("Invalid YouTube URL");

    const cdn = await st.getCdn();

    // පියවර 1: වීඩියෝ විස්තර ලබා ගැනීම (Analyze Link එබූ විට)
    const infoRes = await st.is.post(`https://${cdn}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    });

    const dec = await st.decrypt(infoRes.data.data);

    // Frontend එකෙන් ඉල්ලන්නේ තොරතුරු විතරක් නම් (Analyze mode)
    if (type === "info") {
      return res.json({
        status: true,
        data: {
          title: dec.title,
          thumbnail: dec.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          duration: dec.duration
        }
      });
    }

    // පියවර 2: Download Link එක ලබා ගැනීම (Quality Button එකක් එබූ විට)
    // format එක mp3 නම් 'audio', නැත්නම් 'video' ලෙස සකසයි
    const isAudio = format === 'mp3';
    
    const dlRes = await st.is.post(`https://${cdn}/download`, {
      id: id,
      downloadType: isAudio ? 'audio' : 'video',
      quality: isAudio ? '128' : format,
      key: dec.key
    });

    if (dlRes.data && dlRes.data.data) {
      res.json({ 
        status: true, 
        dl: dlRes.data.data.downloadUrl,
        format: format 
      });
    } else {
      throw new Error("Download link generation failed");
    }

  } catch (e) {
    console.error(e);
    res.json({ status: false, error: e.message });
  }
}
