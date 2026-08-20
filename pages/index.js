"use client";

import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [ytError, setYtError] = useState("");

  const [igUrl, setIgUrl] = useState("");
  const [igLoading, setIgLoading] = useState(false);
  const [igResult, setIgResult] = useState(null);
  const [igError, setIgError] = useState("");

  const [ttUrl, setTtUrl] = useState("");
  const [ttLoading, setTtLoading] = useState(false);
  const [ttResult, setTtResult] = useState(null);
  const [ttError, setTtError] = useState("");

  const [fbUrl, setFbUrl] = useState("");
  const [fbLoading, setFbLoading] = useState(false);
  const [fbResult, setFbResult] = useState(null);
  const [fbError, setFbError] = useState("");

  const [activeTab, setActiveTab] = useState("youtube");

  const switchTab = (tab) => {
    setActiveTab(tab);
    setUrl(""); setVideoInfo(null); setYtError("");
    setIgUrl(""); setIgResult(null); setIgError("");
    setTtUrl(""); setTtResult(null); setTtError("");
    setFbUrl(""); setFbResult(null); setFbError("");
  };

  // ── YouTube handler ──
  const analyzeLink = async () => {
    if (!url) return;
    setLoading(true);
    setVideoInfo(null);
    setYtError("");
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const json = await res.json();
      if (json.status || json.url) {
        setVideoInfo(json);
      } else {
        setYtError("Error! Give me a Valid YT URL.");
      }
    } catch (error) {
      setYtError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Instagram handler ──
  const handleInstagram = async () => {
    if (!igUrl.trim()) return;
    setIgLoading(true); setIgError(""); setIgResult(null);
    try {
      const res = await fetch("/api/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: igUrl.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setIgResult(data.result);
    } catch (err) { setIgError(err.message); } finally { setIgLoading(false); }
  };

  // ── TikTok handler ──
  const handleTikTok = async () => {
    if (!ttUrl.trim()) return;
    setTtLoading(true); setTtError(""); setTtResult(null);
    try {
      const res = await fetch("/api/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ttUrl.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setTtResult(data);
    } catch (err) { setTtError(err.message); } finally { setTtLoading(false); }
  };

  // ── Facebook handler ──
  const handleFacebook = async () => {
    if (!fbUrl.trim()) return;
    setFbLoading(true); setFbError(""); setFbResult(null);
    try {
      const res = await fetch("/api/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fbUrl.trim() })
      });
      const textRes = await res.text(); 
      try {
        const data = JSON.parse(textRes);
        if (!data.success) throw new Error(data.error || "Failed");
        setFbResult(data.result);
      } catch (parseErr) {
        throw new Error("Backend Error: Facebook API Route is missing or crashed.");
      }
    } catch (err) { setFbError(err.message); } finally { setFbLoading(false); }
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
          .main-wrapper { min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; background: linear-gradient(rgba(5,1,10,0.85), rgba(5,1,10,0.85)), url('https://www.image2url.com/r2/default/images/1781415444872-1b4ac2ac-fea0-462e-a131-242f7173ec95.jpg') center/cover fixed; }
          .glass-card { background: rgba(15,2,25,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(138,43,226,0.3); padding: 35px 25px; border-radius: 30px; width: 100%; max-width: 440px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.6); }
          .vortex-title { font-family: 'Orbitron', sans-serif; color: #bd93f9; font-size: 36px; margin: 0; text-shadow: 0 0 20px rgba(189,147,249,0.6); }
          .sub-title { color: #a29bfe; font-size: 11px; margin-bottom: 20px; letter-spacing: 2px; }
          .tab-switcher { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 22px; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 5px; }
          .tab-btn { flex: 1; padding: 9px 4px; border: none; border-radius: 9px; font-size: 11px; font-weight: 600; cursor: pointer; background: transparent; color: #a29bfe; }
          .tab-btn.active-yt { background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: #fff; }
          .tab-btn.active-ig { background: linear-gradient(135deg, #c13584, #fd1d1d); color: #fff; }
          .tab-btn.active-tt { background: linear-gradient(135deg, #010101, #EE1D52); color: #fff; }
          .tab-btn.active-fb { background: linear-gradient(135deg, #1877F2, #3b5998); color: #fff; }
          .input-glass { width: 100%; padding: 15px; margin-bottom: 15px; background: rgba(0,0,0,0.5); border: 1px solid rgba(138,43,226,0.4); border-radius: 12px; color: #fff; outline: none; box-sizing: border-box; }
          .btn-neon { width: 100%; padding: 15px; background: linear-gradient(135deg, #6c5ce7, #a29bfe); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; }
          .result-area { margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(138,43,226,0.2); }
          .thumb-img { width: 100%; border-radius: 14px; max-height: 200px; object-fit: cover; margin-bottom: 10px; }
          .media-links { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
          
          /* Links Styled as Buttons */
          .dl-btn { display: block; text-decoration: none; width: 100%; padding: 13px; border-radius: 12px; color: #fff; font-size: 13px; font-weight: 600; text-align: center; box-sizing: border-box; transition: 0.2s; }
          .dl-btn-yt { background: rgba(108,92,231,0.2); border: 1px solid #6c5ce7; }
          .dl-btn-ig { background: rgba(225,48,108,0.2); border: 1px solid #e1306c; }
          .dl-btn-tt { background: rgba(238,29,82,0.2); border: 1px solid #ee1d52; }
          .dl-btn-fb { background: rgba(24,119,242,0.2); border: 1px solid #1877F2; }
          .dl-btn:hover { filter: brightness(1.2); }
          
          .error-box { color: #ff6b81; font-size: 12px; padding: 12px; background: rgba(255,71,87,0.1); border-radius: 10px; margin-top: 12px; }
          .back-btn { background: none; border: none; color: #ff4757; margin-top: 15px; cursor: pointer; font-size: 11px; }
        `}} />

        <div className="glass-card">
          <h1 className="vortex-title">VORTEX</h1>
          <p className="sub-title">MULTI-FORMAT DOWNLOADER</p>

          <div className="tab-switcher">
            <button className={`tab-btn ${activeTab === "youtube" ? "active-yt" : ""}`} onClick={() => switchTab("youtube")}>YouTube</button>
            <button className={`tab-btn ${activeTab === "instagram" ? "active-ig" : ""}`} onClick={() => switchTab("instagram")}>Instagram</button>
            <button className={`tab-btn ${activeTab === "tiktok" ? "active-tt" : ""}`} onClick={() => switchTab("tiktok")}>TikTok</button>
            <button className={`tab-btn ${activeTab === "facebook" ? "active-fb" : ""}`} onClick={() => switchTab("facebook")}>Facebook</button>
          </div>

          {/* ══ YOUTUBE TAB ══ */}
          {activeTab === "youtube" && (
            <>
              {!videoInfo ? (
                <>
                  <input className="input-glass" placeholder="Paste YouTube Link..." value={url} onChange={(e) => setUrl(e.target.value)} />
                  <button className="btn-neon" onClick={analyzeLink} disabled={loading}>{loading ? "Analyzing..." : "Get Download Link"}</button>
                  {ytError && <div className="error-box">{ytError}</div>}
                </>
              ) : (
                <div className="result-area">
                  {videoInfo.data?.thumbnail && <img className="thumb-img" src={videoInfo.data.thumbnail} alt="thumb" />}
                  
                  <div className="media-links">
                     {/* <a> Tag එකක් භාවිතා කර ඇත */}
                     <a 
                        className="dl-btn dl-btn-yt" 
                        href={videoInfo.dl || videoInfo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        download
                      >
                        ⬇️ Download Media
                      </a>
                  </div>
                  <button className="back-btn" onClick={() => setVideoInfo(null)}>← Try Another</button>
                </div>
              )}
            </>
          )}

          {/* ══ TIKTOK TAB ══ */}
          {activeTab === "tiktok" && (
            <>
              {!ttResult ? (
                <>
                  <input className="input-glass" placeholder="Paste TikTok Link..." value={ttUrl} onChange={(e) => setTtUrl(e.target.value)} />
                  <button className="btn-neon" style={{background: '#ee1d52'}} onClick={handleTikTok} disabled={ttLoading}>{ttLoading ? "Fetching..." : "Get Link"}</button>
                  {ttError && <div className="error-box">{ttError}</div>}
                </>
              ) : (
                <div className="result-area">
                  {ttResult.thumbnail && <img className="thumb-img" src={ttResult.thumbnail} alt="thumb" />}
                  <div className="media-links">
                    {ttResult.downloads?.map((item, i) => (
                      <a key={i} className="dl-btn dl-btn-tt" href={item.url} target="_blank" rel="noopener noreferrer" download>
                        ⬇️ Download Video
                      </a>
                    ))}
                  </div>
                  <button className="back-btn" onClick={() => setTtResult(null)}>← Try Another</button>
                </div>
              )}
            </>
          )}

          {/* ══ FACEBOOK TAB ══ */}
          {activeTab === "facebook" && (
            <>
              {!fbResult ? (
                <>
                  <input className="input-glass" placeholder="Paste Facebook Link..." value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} />
                  <button className="btn-neon" style={{background: '#1877F2'}} onClick={handleFacebook} disabled={fbLoading}>{fbLoading ? "Fetching..." : "Get Link"}</button>
                  {fbError && <div className="error-box">{fbError}</div>}
                </>
              ) : (
                <div className="result-area">
                  <div className="media-links">
                    {fbResult.downloads?.map((item, i) => (
                      <a key={i} className="dl-btn dl-btn-fb" href={item.url} target="_blank" rel="noopener noreferrer" download>
                        ⬇️ Download {item.type || 'Video'}
                      </a>
                    ))}
                  </div>
                  <button className="back-btn" onClick={() => setFbResult(null)}>← Try Another</button>
                </div>
              )}
            </>
          )}

          {/* ══ INSTAGRAM TAB ══ */}
           {activeTab === "instagram" && (
            <>
              {!igResult ? (
                <>
                  <input className="input-glass" placeholder="Paste Instagram Link..." value={igUrl} onChange={(e) => setIgUrl(e.target.value)} />
                  <button className="btn-neon" style={{background: '#e1306c'}} onClick={handleInstagram} disabled={igLoading}>{igLoading ? "Fetching..." : "Get Link"}</button>
                  {igError && <div className="error-box">{igError}</div>}
                </>
              ) : (
                <div className="result-area">
                  {igResult.thumbnail && <img className="thumb-img" src={igResult.thumbnail} alt="thumb" />}
                  <div className="media-links">
                    {igResult.video && (
                      <a className="dl-btn dl-btn-ig" href={igResult.video} target="_blank" rel="noopener noreferrer" download>
                        ⬇️ Download Video
                      </a>
                    )}
                  </div>
                  <button className="back-btn" onClick={() => setIgResult(null)}>← Try Another</button>
                </div>
              )}
            </>
          )}
          
        </div>
      </div>
    </>
  );
}
