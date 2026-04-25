import { useState } from "react";
import Head from "next/head"; // Google Fonts load කරගැනීමට

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
    <>
      <Head>
        {/* 'Vortex' නම සඳහා Orbitron font එක load කරගැනීම */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="glass-container">
        {/* යාවත්කාලීන කළ CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; padding: 0; background: #0f172a; height: 100vh; font-family: 'Poppins', sans-serif; -webkit-font-smoothing: antialiased; }
          
          .glass-container {
            display: flex; justify-content: center; align-items: center;
            height: 100vh; background: radial-gradient(circle at center, #1e293b, #0f172a);
            padding: 20px;
            box-sizing: border-box;
          }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 40px; border-radius: 30px;
            width: 100%; max-width: 420px; text-align: center;
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7);
            box-sizing: border-box;
          }
          
          /* Emoji නැති, ලස්සන Font එකක් සහිත Title එක */
          .vortex-title {
            font-family: 'Orbitron', sans-serif;
            color: #fff;
            font-size: 36px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0 0 5px 0;
            text-shadow: 0 0 10px #06b6d4, 0 0 20px #06b6d4, 0 0 30px #06b6d4;
          }
          
          .sub-title {
            color: #94a3b8; font-size: 14px; margin-bottom: 25px; font-weight: 400;
          }
          
          .input-glass {
            width: 100%; padding: 15px; margin-bottom: 20px;
            background: rgba(255, 255, 255, 0.05); border: 1px solid #334155;
            border-radius: 14px; color: white; outline: none; box-sizing: border-box;
            font-size: 14px; transition: all 0.3s ease;
          }
          .input-glass:focus { border-color: #06b6d4; box-shadow: 0 0 10px rgba(6, 182, 212, 0.2); }
          
          .btn-neon {
            width: 100%; padding: 15px; background: #06b6d4;
            border: none; border-radius: 14px; color: white;
            font-weight: 600; cursor: pointer; transition: 0.3s;
            text-transform: uppercase; letter-spacing: 1px; font-size: 14px;
          }
          .btn-neon:hover { background: #0891b2; box-shadow: 0 0 25px #06b6d4; transform: translateY(-1px); }
          .btn-neon:active { transform: translateY(1px); }
          
          /* Result Card එක */
          .result-card { margin-top: 35px; border-top: 1px solid #334155; padding-top: 25px; text-align: left; }
          
          /* Thumbnail එක සඳහා Glassy Glow Frame එක */
          .thumb-frame {
            width: 100%;
            padding: 6px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.2), inset 0 0 10px rgba(6, 182, 212, 0.1);
            margin-bottom: 15px;
            box-sizing: border-box;
            overflow: hidden;
            display: flex; justify-content: center; align-items: center;
          }
          .thumb-img { width: 100%; border-radius: 12px; }
          
          /* Video Title එක */
          .video-title { color: #f1f5f9; font-size: 14px; margin-bottom: 15px; font-weight: 400; line-height: 1.5; }
          .video-title strong { color: #06b6d4; font-weight: 600; } /* 'Title:' කොටස සඳහා */
          
          .download-link {
            color: #22d3ee; text-decoration: none; font-weight: 600; font-size: 16px;
            display: flex; align-items: center; gap: 8px; justify-content: center;
            text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;
          }
          .download-link:hover { color: #fff; text-shadow: 0 0 10px #22d3ee; }
        `}} />

        <div className="glass-card">
          {/* අලුත් Vortex Title */}
          <h1 className="vortex-title">VORTEX</h1>
          <p className="sub-title">YouTube to MP3 Downloader</p>

          <input
            className="input-glass"
            placeholder="Paste YouTube Link Here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button className="btn-neon" onClick={download} disabled={loading}>
            {loading ? "Processing..." : "Download MP3"}
          </button>

          {data?.status && (
            <div className="result-card">
              {/* Thumbnail Frame එක */}
              <div className="thumb-frame">
                <img className="thumb-img" src={data.data.thumb} alt="thumbnail" />
              </div>

              {/* අලුත් Video Title එක */}
              <p className="video-title">
                <strong>Title:</strong> {data.data.title}
              </p>

              <a className="download-link" href={data.data.download} target="_blank" rel="noreferrer">
                ⬇ Download Audio
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
