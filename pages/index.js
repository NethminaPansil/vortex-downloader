"use client";

import { useState } from "react";
import Head from "next/head";

export default function Home() {
  // ── YouTube state ──
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);

  // ── Instagram state ──
  const [igUrl, setIgUrl] = useState("");
  const [igLoading, setIgLoading] = useState(false);
  const [igResult, setIgResult] = useState(null);
  const [igError, setIgError] = useState("");

  // ── TikTok state ──
  const [ttUrl, setTtUrl] = useState("");
  const [ttLoading, setTtLoading] = useState(false);
  const [ttResult, setTtResult] = useState(null);
  const [ttError, setTtError] = useState("");

  // ── Active tab ──
  const [activeTab, setActiveTab] = useState("youtube");

  const switchTab = (tab) => {
    setActiveTab(tab);
    // Reset all states on tab switch
    setUrl(""); setVideoInfo(null); setDownloadLink(null);
    setIgUrl(""); setIgResult(null); setIgError("");
    setTtUrl(""); setTtResult(null); setTtError("");
  };

  // ── YouTube handlers ──
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
      if (json.status) setDownloadLink({ link: json.dl, format });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Instagram handler ──
  const handleInstagram = async () => {
    if (!igUrl.trim()) return;
    setIgLoading(true);
    setIgError("");
    setIgResult(null);
    try {
      const res = await fetch("/api/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: igUrl.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setIgResult(data);
    } catch (err) {
      setIgError(err.message);
    } finally {
      setIgLoading(false);
    }
  };

  // ── TikTok handler ──
  const handleTikTok = async () => {
    if (!ttUrl.trim()) return;
    setTtLoading(true);
    setTtError("");
    setTtResult(null);
    try {
      const res = await fetch("/api/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ttUrl.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setTtResult(data);
    } catch (err) {
      setTtError(err.message);
    } finally {
      setTtLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Vortex Multi-Downloader</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="main-wrapper">
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background-color: #05010a; }

          .main-wrapper {
            min-height: 100vh; display: flex; justify-content: center; align-items: center;
            padding: 20px; box-sizing: border-box; background-size: cover;
            background-position: center; background-repeat: no-repeat; background-attachment: fixed;
            background-image: linear-gradient(rgba(5,1,10,0.75), rgba(5,1,10,0.75)),
              url('https://pmd-img2url.koyeb.app/v/37b283cde9b2b713cccf287a39212e37.jpg');
          }
          @media (max-width: 768px) {
            .main-wrapper {
              background-image: linear-gradient(rgba(5,1,10,0.75), rgba(5,1,10,0.75)),
                url('https://pmd-img2url.koyeb.app/v/d298774c05692f31633940598b648509.jpg');
            }
          }

          .glass-card {
            background: rgba(15,2,25,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(138,43,226,0.3); padding: 35px 25px; border-radius: 30px;
            width: 100%; max-width: 420px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.6);
          }

          .vortex-title {
            font-family: 'Orbitron', sans-serif; color: #bd93f9; font-size: 38px;
            text-transform: uppercase; letter-spacing: 4px; margin: 0;
            text-shadow: 0 0 20px rgba(189,147,249,0.6);
          }
          .sub-title { color: #a29bfe; font-size: 12px; margin-bottom: 20px; letter-spacing: 2px; opacity: 0.8; }

          /* ── Tabs ── */
          .tab-switcher {
            display: flex; gap: 6px; margin-bottom: 22px;
            background: rgba(0,0,0,0.3); border-radius: 12px; padding: 5px;
          }
          .tab-btn {
            flex: 1; padding: 9px 4px; border: none; border-radius: 9px;
            font-size: 11px; font-weight: 600; cursor: pointer; transition: 0.25s;
            background: transparent; color: #a29bfe; letter-spacing: 0.3px;
          }
          .tab-btn.active-yt {
            background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: #fff;
            box-shadow: 0 4px 12px rgba(108,92,231,0.4);
          }
          .tab-btn.active-ig {
            background: linear-gradient(135deg, #c13584, #e1306c, #fd1d1d);
            color: #fff; box-shadow: 0 4px 12px rgba(225,48,108,0.4);
          }
          .tab-btn.active-tt {
            background: linear-gradient(135deg, #010101, #69C9D0, #EE1D52);
            color: #fff; box-shadow: 0 4px 12px rgba(238,29,82,0.4);
          }

          /* ── Inputs ── */
          .input-glass {
            width: 100%; padding: 15px; margin-bottom: 15px;
            background: rgba(0,0,0,0.5); border: 1px solid rgba(138,43,226,0.4);
            border-radius: 12px; color: #fff; outline: none; box-sizing: border-box; font-size: 13px;
          }
          .input-glass.ig-input { border-color: rgba(225,48,108,0.4); }
          .input-glass.tt-input { border-color: rgba(238,29,82,0.4); }

          /* ── Buttons ── */
          .btn-neon {
            width: 100%; padding: 15px; background: linear-gradient(135deg, #6c5ce7, #a29bfe);
            border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: 0.3s;
          }
          .btn-neon:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(108,92,231,0.4); }

          .btn-neon-ig {
            width: 100%; padding: 15px;
            background: linear-gradient(135deg, #c13584, #e1306c, #fd1d1d);
            border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: 0.3s;
          }
          .btn-neon-ig:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(225,48,108,0.35); }

          .btn-neon-tt {
            width: 100%; padding: 15px;
            background: linear-gradient(135deg, #010101 0%, #69C9D0 50%, #EE1D52 100%);
            border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: 0.3s;
          }
          .btn-neon-tt:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(238,29,82,0.35); }

          .btn-neon:disabled, .btn-neon-ig:disabled, .btn-neon-tt:disabled {
            opacity: 0.6; cursor: not-allowed; transform: none;
          }

          /* ── YouTube result ── */
          .result-area { margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(138,43,226,0.2); }
          .thumb-frame {
            width: 100%; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 18px;
            border: 1px solid rgba(138,43,226,0.3); margin-bottom: 15px; box-sizing: border-box;
          }
          .thumb-img { width: 100%; border-radius: 14px; display: block; }
          .video-title-text { color: #eee; font-size: 13px; margin-bottom: 15px; text-align: left; }
          .video-title-text span { color: #bd93f9; font-weight: 600; }
          .q-label { color: #a29bfe; font-size: 12px; font-weight: bold; text-align: left; margin: 10px 0 5px 2px; }
          .q-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 15px; }
          .q-btn {
            padding: 8px; background: rgba(138,43,226,0.15);
            border: 1px solid rgba(138,43,226,0.4); color: #fff;
            border-radius: 8px; font-size: 11px; cursor: pointer; transition: 0.2s;
          }
          .q-btn:hover { background: #6c5ce7; border-color: #a29bfe; }
          .dl-container {
            margin-top: 20px; padding: 15px;
            background: rgba(46,213,115,0.1); border: 1px dashed #2ed573; border-radius: 12px;
          }
          .download-link { color: #2ed573; text-decoration: none; font-weight: 600; font-size: 14px; }

          /* ── Instagram result ── */
          .ig-result-area { margin-top: 20px; padding-top: 18px; border-top: 1px solid rgba(225,48,108,0.25); }
          .ig-thumb-frame {
            width: 100%; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 18px;
            border: 1px solid rgba(225,48,108,0.3); margin-bottom: 14px; box-sizing: border-box;
          }
          .ig-media-links { display: flex; flex-direction: column; gap: 10px; }
          .ig-dl-btn {
            display: block; width: 100%; padding: 13px;
            background: linear-gradient(135deg, rgba(193,53,132,0.2), rgba(225,48,108,0.2));
            border: 1px solid rgba(225,48,108,0.5); border-radius: 12px;
            color: #fff; text-decoration: none; font-size: 13px; font-weight: 600;
            transition: 0.25s; box-sizing: border-box; text-align: center;
          }
          .ig-dl-btn:hover {
            background: linear-gradient(135deg, #c13584, #e1306c);
            box-shadow: 0 6px 16px rgba(225,48,108,0.35); transform: translateY(-2px);
          }

          /* ── TikTok result ── */
          .tt-result-area { margin-top: 20px; padding-top: 18px; border-top: 1px solid rgba(238,29,82,0.25); }
          .tt-thumb-frame {
            width: 100%; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 18px;
            border: 1px solid rgba(105,201,208,0.3); margin-bottom: 14px; box-sizing: border-box;
          }
          .tt-stats {
            display: flex; justify-content: space-around; margin-bottom: 14px;
            background: rgba(0,0,0,0.3); border-radius: 10px; padding: 10px;
          }
          .tt-stat { text-align: center; }
          .tt-stat-val { color: #69C9D0; font-weight: 700; font-size: 13px; }
          .tt-stat-label { color: #aaa; font-size: 10px; }
          .tt-media-links { display: flex; flex-direction: column; gap: 10px; }
          .tt-dl-btn {
            display: block; width: 100%; padding: 13px;
            background: rgba(238,29,82,0.12);
            border: 1px solid rgba(105,201,208,0.4); border-radius: 12px;
            color: #fff; text-decoration: none; font-size: 12px; font-weight: 600;
            transition: 0.25s; box-sizing: border-box; text-align: center;
          }
          .tt-dl-btn:hover {
            background: linear-gradient(135deg, #010101, #69C9D0, #EE1D52);
            box-shadow: 0 6px 16px rgba(238,29,82,0.3); transform: translateY(-2px);
          }
          .tt-dl-btn.nowm { border-color: rgba(105,201,208,0.7); }
          .tt-dl-btn.audio { border-color: rgba(238,29,82,0.5); }

          /* ── Shared ── */
          .error-box {
            color: #ff6b81; font-size: 12px; padding: 12px;
            background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.3);
            border-radius: 10px; margin-top: 12px; text-align: left;
          }
          .back-btn {
            background: none; border: none; color: #ff4757;
            margin-top: 15px; cursor: pointer; font-size: 11px;
          }
        `}} />

        <div className="glass-card">
          <h1 className="vortex-title">VORTEX</h1>
          <p className="sub-title">MULTI-FORMAT DOWNLOADER</p>

          {/* ── Tab Switcher ── */}
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === "youtube" ? "active-yt" : ""}`}
              onClick={() => switchTab("youtube")}
            >▶ YouTube</button>
            <button
              className={`tab-btn ${activeTab === "instagram" ? "active-ig" : ""}`}
              onClick={() => switchTab("instagram")}
            >📸 Instagram</button>
            <button
              className={`tab-btn ${activeTab === "tiktok" ? "active-tt" : ""}`}
              onClick={() => switchTab("tiktok")}
            >🎵 TikTok</button>
          </div>

          {/* ══ YOUTUBE TAB ══ */}
          {activeTab === "youtube" && (
            <>
              {!videoInfo ? (
                <>
                  <input
                    className="input-glass"
                    placeholder="Paste YouTube Link..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && analyzeLink()}
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
                    <button className="q-btn" onClick={() => startDownload("mp3")}>MP3 (Audio)</button>
                  </div>

                  <div className="q-label">Video Quality:</div>
                  <div className="q-grid">
                    {["144","240","360","480","720","1080"].map((q) => (
                      <button key={q} className="q-btn" onClick={() => startDownload(q)}>{q}P</button>
                    ))}
                  </div>

                  {loading && <p style={{color:"#a29bfe",fontSize:"12px"}}>Generating link...</p>}

                  {downloadLink && (
                    <div className="dl-container">
                      <a className="download-link" href={downloadLink.link} target="_blank" rel="noreferrer">
                        ⬇️ DOWNLOAD {downloadLink.format.toUpperCase()} NOW
                      </a>
                    </div>
                  )}
                  <button className="back-btn" onClick={() => { setVideoInfo(null); setDownloadLink(null); setUrl(""); }}>
                    ← Back to Home
                  </button>
                </div>
              )}
            </>
          )}

          {/* ══ INSTAGRAM TAB ══ */}
          {activeTab === "instagram" && (
            <>
              {!igResult ? (
                <>
                  <input
                    className="input-glass ig-input"
                    placeholder="Paste Instagram Link... (Post / Reel / Story)"
                    value={igUrl}
                    onChange={(e) => setIgUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInstagram()}
                  />
                  <button className="btn-neon-ig" onClick={handleInstagram} disabled={igLoading}>
                    {igLoading ? "Fetching..." : "Get Download Link"}
                  </button>
                  {igError && <div className="error-box">⚠️ {igError}</div>}
                </>
              ) : (
                <div className="ig-result-area">
                  {igResult.thumbnail && (
                    <div className="ig-thumb-frame">
                      <img className="thumb-img" src={igResult.thumbnail} alt="ig-thumb" />
                    </div>
                  )}
                  {igResult.title && (
                    <p className="video-title-text">
                      <span>Caption:</span>{" "}
                      {igResult.title.length > 80 ? igResult.title.slice(0, 80) + "…" : igResult.title}
                    </p>
                  )}
                  <div className="ig-media-links">
                    {igResult.url.map((item, i) => (
                      <a key={i} className="ig-dl-btn" href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.type === "video"
                          ? `📹 Download Video${igResult.url.length > 1 ? ` ${i+1}` : ""}`
                          : `🖼️ Download Image${igResult.url.length > 1 ? ` ${i+1}` : ""}`}
                        {item.ext ? ` (.${item.ext})` : ""}
                      </a>
                    ))}
                  </div>
                  <button className="back-btn" onClick={() => { setIgResult(null); setIgError(""); setIgUrl(""); }}>
                    ← Try Another Link
                  </button>
                </div>
              )}
            </>
          )}

          {/* ══ TIKTOK TAB ══ */}
          {activeTab === "tiktok" && (
            <>
              {!ttResult ? (
                <>
                  <input
                    className="input-glass tt-input"
                    placeholder="Paste TikTok Link..."
                    value={ttUrl}
                    onChange={(e) => setTtUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTikTok()}
                  />
                  <button className="btn-neon-tt" onClick={handleTikTok} disabled={ttLoading}>
                    {ttLoading ? "Fetching..." : "Get Download Link"}
                  </button>
                  {ttError && <div className="error-box">⚠️ {ttError}</div>}
                </>
              ) : (
                <div className="tt-result-area">
                  {/* Thumbnail */}
                  {ttResult.thumbnail && (
                    <div className="tt-thumb-frame">
                      <img className="thumb-img" src={ttResult.thumbnail} alt="tt-thumb" />
                    </div>
                  )}

                  {/* Author + description */}
                  {ttResult.author && (
                    <p className="video-title-text"><span>@</span>{ttResult.author}</p>
                  )}
                  {ttResult.description && (
                    <p className="video-title-text" style={{fontSize:"11px",opacity:0.7}}>
                      {ttResult.description.length > 80 ? ttResult.description.slice(0,80)+"…" : ttResult.description}
                    </p>
                  )}

                  {/* Stats */}
                  {ttResult.stats && (
                    <div className="tt-stats">
                      <div className="tt-stat">
                        <div className="tt-stat-val">❤️ {ttResult.stats.likes}</div>
                        <div className="tt-stat-label">Likes</div>
                      </div>
                      <div className="tt-stat">
                        <div className="tt-stat-val">💬 {ttResult.stats.comments}</div>
                        <div className="tt-stat-label">Comments</div>
                      </div>
                      <div className="tt-stat">
                        <div className="tt-stat-val">↗️ {ttResult.stats.shares}</div>
                        <div className="tt-stat-label">Shares</div>
                      </div>
                    </div>
                  )}

                  {/* Download links */}
                  <div className="tt-media-links">
                    {ttResult.downloads
                      .filter(d => d.watermark === "without" && d.type === "video")
                      .map((item, i) => (
                        <a key={`nowm-${i}`} className="tt-dl-btn nowm" href={item.url} target="_blank" rel="noopener noreferrer">
                          🎬 No Watermark {item.quality === "hd" ? "(HD)" : "(SD)"}
                        </a>
                      ))}
                    {ttResult.downloads
                      .filter(d => d.type === "audio")
                      .map((item, i) => (
                        <a key={`audio-${i}`} className="tt-dl-btn audio" href={item.url} target="_blank" rel="noopener noreferrer">
                          🎵 Download MP3
                        </a>
                      ))}
                    {ttResult.downloads
                      .filter(d => d.watermark === "with" && d.type === "video")
                      .map((item, i) => (
                        <a key={`wm-${i}`} className="tt-dl-btn" href={item.url} target="_blank" rel="noopener noreferrer">
                          📹 With Watermark {item.quality === "hd" ? "(HD)" : "(SD)"}
                        </a>
                      ))}
                  </div>

                  <button className="back-btn" onClick={() => { setTtResult(null); setTtError(""); setTtUrl(""); }}>
                    ← Try Another Link
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
