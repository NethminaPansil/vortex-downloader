import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);

  // වීඩියෝ විස්තර ලබා ගැනීමට (Analyze)
  const analyzeLink = async () => {
    if (!url) return;
    setLoading(true);
    setVideoInfo(null);
    setDownloadLink(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type: "info" })
      });
      const json = await res.json();
      if (json.status) {
        setVideoInfo(json.data);
      } else {
        alert("සබැඳිය පරීක්ෂා කරන්න!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // තෝරාගත් format එක download කිරීමට
  const startDownload = async (format) => {
    setLoading(true);
    setDownloadLink(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format })
      });
      const json = await res.json();
      if (json.status) {
        setDownloadLink({ link: json.dl, format: format });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vortex Multi-Downloader</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="main-wrapper">
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background-color: #05010a; }
          
          .main-wrapper {
            min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;
            background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;
            background-image: linear-gradient(rgba(5, 1, 10, 0.75), rgba(5, 1, 10, 0.75)), url('https://pmd-img2url.koyeb.app/v/37b283cde9b2b713cccf287a39212e37.jpg');
          }

          @media (max-width: 768px) {
            .main-wrapper { background-image: linear-gradient(rgba(5, 1, 10, 0.75), rgba(5, 1, 10, 0.75)), url('https://pmd-img2url.koyeb.app/v/d298774c05692f31633940598b648509.jpg'); }
          }

          .glass-card {
            background: rgba(15, 2, 25, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(138, 43, 226, 0.3); padding: 35px 25px; border-radius: 30px;
            width: 100%; max-width: 420px; text-align: center; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
          }

          .vortex-title {
            font-family: 'Orbitron', sans-serif; color: #bd93f9; font-size: 38px; text-transform: uppercase;
            letter-spacing: 4px; margin: 0; text-shadow: 0 0 20px rgba(189, 147, 249, 0.6);
          }

          .sub-title { color: #a29bfe; font-size: 12px; margin-bottom: 25px; letter-spacing: 2px; opacity: 0.8; }

          .input-glass {
            width: 100%; padding: 15px; margin-bottom: 15px; background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(138, 43, 226, 0.4); border-radius: 12px; color: #fff; outline: none; box-sizing: border-box;
          }

          .btn-neon {
            width: 100%; padding: 15px; background: linear-gradient(135deg, #6c5ce7, #a29bfe);
            border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: 0.3s;
          }

          .btn-neon:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(108, 92, 231, 0.4); }

          .result-area { margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(138, 43, 226, 0.2); }
          
          .thumb-frame { width: 100%; padding: 6px; background: rgba(0, 0, 0, 0.3); border-radius: 18px; border: 1px solid rgba(138, 43, 226, 0.3); margin-bottom: 15px; box-sizing: border-box; }
          .thumb-img { width: 100%; border-radius: 14px; display: block; }
          
          .video-title-text { color: #eee; font-size: 13px; margin-bottom: 15px; text-align: left; }
          .video-title-text span { color: #bd93f9; font-weight: 600; }

          .q-label { color: #a29bfe; font-size: 12px; font-weight: bold; text-align: left; margin: 10px 0 5px 2px; }

          .q-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 15px; }
          
          .q-btn {
            padding: 8px; background: rgba(138, 43, 226, 0.15); border: 1px solid rgba(138, 43, 226, 0.4);
            color: #fff; border-radius: 8px; font-size: 11px; cursor: pointer; transition: 0.2s;
          }
          .q-btn:hover { background: #6c5ce7; border-color: #a29bfe; }

          .dl-container { margin-top: 20px; padding: 15px; background: rgba(46, 213, 115, 0.1); border: 1px dashed #2ed573; border-radius: 12px; }
          .download-link { color: #2ed573; text-decoration: none; font-weight: 600; font-size: 14px; }
        `}} />

        <div className="glass-card">
          <h1 className="vortex-title">VORTEX</h1>
          <p className="sub-title">MULTI-FORMAT DOWNLOADER</p>

          {!videoInfo ? (
            <>
              <input
                className="input-glass"
                placeholder="Paste YouTube Link..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button className="btn-neon" onClick={analyzeLink} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze Link"}
              </button>
            </>
          ) : (
            <div className="result-area">
              <div className="thumb-frame">
                <img className="thumb-img" src={videoInfo.thumbnail} alt="thumb" />
              </div>
              <p className="video-title-text"><span>Title:</span> {videoInfo.title}</p>

              <div className="q-label">Audio:</div>
              <div className="q-grid">
                <button className="q-btn" onClick={() => startDownload('mp3')}>MP3 (Audio)</button>
              </div>

              <div className="q-label">Video Quality:</div>
              <div className="q-grid">
                {['144', '240', '360', '480', '720', '1080'].map((q) => (
                  <button key={q} className="q-btn" onClick={() => startDownload(q)}>{q}P</button>
                ))}
              </div>

              {loading && <p style={{color: '#a29bfe', fontSize: '12px'}}>Generating link...</p>}

              {downloadLink && (
                <div className="dl-container">
                  <a className="download-link" href={downloadLink.link} target="_blank" rel="noreferrer">
                    ⬇️ DOWNLOAD {downloadLink.format.toUpperCase()} NOW
                  </a>
                </div>
              )}

              <button 
                onClick={() => {setVideoInfo(null); setDownloadLink(null); setUrl("");}} 
                style={{background: 'none', border: 'none', color: '#ff4757', marginTop: '15px', cursor: 'pointer', fontSize: '11px'}}
              >
                ← Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
