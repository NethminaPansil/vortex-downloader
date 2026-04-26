import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);

  const analyzeLink = async () => {
    if (!url) return;
    setLoading(true);
    setVideoInfo(null);
    setDownloadLink(null);

    const isTikTok = url.includes("tiktok.com");
    const apiEndpoint = isTikTok ? "/api/tiktok" : "/api/download";

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type: "info" })
      });
      const json = await res.json();

      if (isTikTok) {
        if (json.success) {
          setVideoInfo({
            title: json.result.title,
            thumbnail: json.result.thumbnail, // TikTok thumbnail
            isTikTok: true,
            downloads: json.result.downloads
          });
        } else {
          alert("TikTok error: " + json.result);
        }
      } else {
        if (json.status) {
          setVideoInfo({
            title: json.data.title,
            thumbnail: json.data.thumbnail || json.data.thumb, // YouTube thumbnail fixed
            isTikTok: false
          });
        } else {
          alert("YouTube error!");
        }
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
        setDownloadLink({ link: json.dl || json.data?.download, format: format });
      }
    } catch (error) {
      alert("Download error!");
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
          
          /* Background Image Fix - මම මෙතන කෙලින්ම URL එක දානවා */
          .main-wrapper {
            min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;
            background-size: cover; background-position: center; background-repeat: no-repeat;
            background-image: linear-gradient(rgba(5, 1, 10, 0.8), rgba(5, 1, 10, 0.8)), url('https://pmd-img2url.koyeb.app/v/37b283cde9b2b713cccf287a39212e37.jpg');
          }

          @media (max-width: 768px) {
            .main-wrapper { background-image: linear-gradient(rgba(5, 1, 10, 0.8), rgba(5, 1, 10, 0.8)), url('https://pmd-img2url.koyeb.app/v/d298774c05692f31633940598b648509.jpg'); }
          }

          .glass-card {
            background: rgba(20, 10, 30, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(138, 43, 226, 0.3); padding: 30px; border-radius: 30px;
            width: 100%; max-width: 400px; text-align: center; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
          }
          
          .vortex-title { font-family: 'Orbitron', sans-serif; color: #bd93f9; font-size: 35px; letter-spacing: 3px; margin: 0; text-shadow: 0 0 15px rgba(189, 147, 249, 0.6); }
          .input-glass { width: 100%; padding: 14px; margin: 20px 0; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(138, 43, 226, 0.4); border-radius: 12px; color: #fff; outline: none; box-sizing: border-box; }
          .btn-neon { width: 100%; padding: 14px; background: linear-gradient(135deg, #6c5ce7, #a29bfe); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; text-transform: uppercase; }
          .thumb-frame { width: 100%; padding: 5px; background: rgba(0,0,0,0.4); border-radius: 15px; border: 1px solid #444; margin: 20px 0; overflow: hidden; }
          .thumb-img { width: 100%; border-radius: 10px; display: block; }
          .video-title-text { color: #fff; font-size: 13px; text-align: left; margin: 10px 0; line-height: 1.4; }
          .q-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .q-btn { padding: 10px; background: rgba(138, 43, 226, 0.2); border: 1px solid #8a2be2; color: #fff; border-radius: 8px; font-size: 11px; cursor: pointer; text-decoration: none; }
          .dl-container { margin-top: 15px; padding: 12px; background: rgba(0, 255, 100, 0.1); border: 1px dashed #00ff64; border-radius: 10px; }
          .download-link { color: #00ff64; text-decoration: none; font-weight: bold; font-size: 13px; }
        `}} />

        <div className="glass-card">
          <h1 className="vortex-title">VORTEX</h1>
          
          {!videoInfo ? (
            <>
              <input className="input-glass" placeholder="Paste Link Here..." value={url} onChange={(e) => setUrl(e.target.value)} />
              <button className="btn-neon" onClick={analyzeLink} disabled={loading}>{loading ? "Analyzing..." : "Analyze Link"}</button>
            </>
          ) : (
            <div>
              <div className="thumb-frame">
                <img className="thumb-img" src={videoInfo.thumbnail} alt="Thumbnail" />
              </div>
              <p className="video-title-text"><span style={{color:'#bd93f9'}}>Title:</span> {videoInfo.title}</p>

              <div className="q-grid">
                {videoInfo.isTikTok ? (
                  videoInfo.downloads.map((dl, i) => (
                    <a key={i} href={dl.url} target="_blank" rel="noreferrer" className="q-btn">{dl.type}</a>
                  ))
                ) : (
                  <>
                    <button className="q-btn" onClick={() => startDownload('mp3')}>MP3 Audio</button>
                    <button className="q-btn" onClick={() => startDownload('720')}>720P Video</button>
                    <button className="q-btn" onClick={() => startDownload('360')}>360P Video</button>
                    <button className="q-btn" onClick={() => startDownload('1080')}>1080P Video</button>
                  </>
                )}
              </div>

              {downloadLink && (
                <div className="dl-container">
                  <a className="download-link" href={downloadLink.link} target="_blank" rel="noreferrer">⬇️ CLICK TO DOWNLOAD</a>
                </div>
              )}

              <button onClick={() => {setVideoInfo(null); setUrl(""); setDownloadLink(null);}} style={{marginTop:'20px', background:'none', border:'none', color:'#ff4757', cursor:'pointer'}}>← Back</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
