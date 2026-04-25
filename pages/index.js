import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const download = async () => {
    if (!url) return;
    setLoading(true);
    setData(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-container">
      {/* CSS ටික Component එක ඇතුළේ */}
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; padding: 0; background: #0f172a; height: 100vh; font-family: sans-serif; }
        .glass-container {
          display: flex; justify-content: center; align-items: center;
          height: 100vh; background: radial-gradient(circle, #1e293b, #0f172a);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px; border-radius: 24px;
          width: 380px; text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .title { color: #22d3ee; font-size: 28px; text-shadow: 0 0 15px #22d3ee; margin-bottom: 10px; }
        .input-glass {
          width: 100%; padding: 12px; margin: 20px 0;
          background: rgba(255, 255, 255, 0.05); border: 1px solid #334155;
          border-radius: 12px; color: white; outline: none; box-sizing: border-box;
        }
        .btn-neon {
          width: 100%; padding: 12px; background: #06b6d4;
          border: none; border-radius: 12px; color: white;
          font-weight: bold; cursor: pointer; transition: 0.3s;
        }
        .btn-neon:hover { background: #0891b2; box-shadow: 0 0 20px #06b6d4; }
        .result-card { margin-top: 25px; border-top: 1px solid #334155; padding-top: 20px; }
        .thumb-img { width: 100%; border-radius: 12px; margin-bottom: 10px; }
        .download-link { color: #22d3ee; text-decoration: none; font-weight: bold; }
      `}} />

      <div className="glass-card">
        <h1 className="title">⚡ Vortex Music</h1>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>Premium YouTube Downloader</p>

        <input
          className="input-glass"
          placeholder="Paste YouTube Link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button className="btn-neon" onClick={download} disabled={loading}>
          {loading ? "Processing..." : "Download MP3"}
        </button>

        {data?.status && (
          <div className="result-card">
            <img className="thumb-img" src={data.data.thumb} alt="thumb" />
            <p style={{ color: "white", fontSize: "14px" }}>{data.data.title}</p>
            <a className="download-link" href={data.data.download} target="_blank" rel="noreferrer">
              ⬇ Download Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
