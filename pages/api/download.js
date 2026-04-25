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
        "user-agent": "Mozilla/5.0"
      }
    });
  }

  async decrypt(enc) {
    const sr = Buffer.from(enc, "base64");
    const ky = Buffer.from(this.ky, "hex");
    const iv = sr.slice(0, 16);
    const dt = sr.slice(16);

    const dc = crypto.createDecipheriv("aes-128-cbc", ky, iv);
    return JSON.parse(Buffer.concat([dc.update(dt), dc.final()]).toString());
  }

  async getCdn() {
    const res = await this.is.get("https://media.savetube.vip/api/random-cdn");
    return res.data.cdn;
  }

  async download(url) {
    const id = url.match(this.m)?.[1];
    if (!id) throw new Error("Invalid URL");

    const cdn = await this.getCdn();

    const info = await this.is.post(`https://${cdn}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    });

    const dec = await this.decrypt(info.data.data);

    const dl = await this.is.post(`https://${cdn}/download`, {
      id,
      downloadType: "audio",
      quality: "128",
      key: dec.key
    });

    return {
      title: dec.title,
      thumb: dec.thumbnail,
      download: dl.data.data.downloadUrl
    };
  }
}

export default async function handler(req, res) {
  try {
    const { url } = req.body;
    const st = new SaveTube();
    const data = await st.download(url);
    res.json({ status: true, data });
  } catch (e) {
    res.json({ status: false, error: e.message });
  }
}
