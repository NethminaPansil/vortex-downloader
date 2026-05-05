import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);

  const analyzeLink = async () => {
    if (!url) {
      alert("Error: Please paste a URL first.");
      return;
    }
    
    setLoading(true);
    setVideoInfo(null);

    // Endpoint එක තීරණය කිරීම
    let apiEndpoint = "/api/download"; // Default for FB/YT
    if (url.includes("tiktok.com")) {
      apiEndpoint = "/api/tiktok";
    }

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      
      const json = await res.json();

      if (json.success || json.status) {
        // TikTok සහ අනෙක් ඒවා අතර response එක සමාන කරගැනීම
        const data = json.result || json.data;
        
        setVideoInfo({
          title: data.title || "Social Media Video",
          thumbnail: data.thumbnail || data.thumb || data.cover,
          downloads: data.downloads || [] 
        });
      } else {
        alert("Extraction Failed: " + (json.result || json.message || "Invalid Link"));
      }
    } catch (error) {
      alert("System Error: Unable to connect to the server.");
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
            background-size: cover; background-position: center; background-repeat: no-repeat;
            background-image: linear-gradient(rgba(5, 1, 10, 0.85), rgba(5, 1, 10, 0.85)), url('https://pmd-img2url.koyeb.app/v/37b283cde9b2b713cccf287a39212e37.jpg');
          }

          .glass-card {
            background: rgba(20, 10, 30, 0.7); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(138, 43, 226, 0.3); padding: 30px; border-radius: 30px;
            width: 100%; max-width: 420px; text-align: center; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.9);
          }
          
          .vortex-title { font-family: 'Orbitron', sans-serif; color: #bd93f9; font-size: 38px; letter-spacing: 4px; margin-bottom: 25px; text-shadow: 0 0 20px rgba(189, 147, 249, 0.5); }
          .input-glass { width: 100%; padding: 15px; margin-bottom: 15px; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(138, 43, 226, 0.4); border-radius: 12px; color: #fff; outline: none; box-sizing: border-box; transition: 0.3s; font-size: 14px; }
          .input-glass:focus { border-color: #bd93f9; box-shadow: 0 0 15px rgba(189, 147, 249, 0.4); }
          
          .btn-neon { width: 100%; padding: 15px; background: linear-gradient(135deg, #6c5ce7, #a29bfe); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: 0.3s; }
          .btn-neon:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(108, 92, 231, 0.6); }
          .btn-neon:disabled { background: #333; color: #777; cursor: not-allowed; }

          .result-container { animation: fadeIn 0.5s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

          .thumb-frame { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 15px; border: 1px solid #444; margin: 20px 0; overflow: hidden; position: relative; }
          .thumb-img { width: 100%; height: 100%; object-fit: cover; }
          
          .video-title-text { color: #eee; font-size: 14px; margin-bottom: 20px; line-height: 1.5; text-align: left; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          
          .q-grid { display: grid; grid-template-columns: 1fr; gap: 12px; max-height: 250px; overflow-y: auto; padding-right: 5px; }
          /* Scrollbar Style */
          .q-grid::-webkit-scrollbar { width: 5px; }
          .q-grid::-webkit-scrollbar-thumb { background: #8a2be2; border-radius: 10px; }

          .dl-btn { 
            padding: 14px; background: rgba(138, 43, 226, 0.15); border: 1px solid rgba(138, 43, 226, 0.5); 
            color: #fff; border-radius: 12px; font-size: 13px; font-weight: 600;
            text-decoration: none; display: flex; justify-content: space-between; align-items: center;
            transition: 0.2s;
          }
          .dl-btn:hover { background: rgba(138, 43, 226, 0.4); border-color: #bd93f9; }
          .dl-btn span { background: #bd93f9; color: #000; padding: 2px 8px; border-radius: 5px; font-size: 10px; text-transform: uppercase; }
          
          .back-btn { margin-top: 25px; background: none; border: none; color: #ff4757; cursor: pointer; font-size: 14px; font-weight: 600; opacity: 0.8; }
          .back-btn:hover { opacity: 1; text-decoration: underline; }
        `}} />

        <div className="glass-card">
          <h1 className="vortex-title">VORTEX</h1>
          
          {!videoInfo ? (
            <>
              <input 
                className="input-glass" 
                placeholder="Paste TikTok, YT, or FB Link..." 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
              />
              <button className="btn-neon" onClick={analyzeLink} disabled={loading}>
                {loading ? "Analyzing Video..." : "Start Download"}
              </button>
            </>
          ) : (
            <div className="result-container">
              <div className="thumb-frame">
                <img className="thumb-img" src={videoInfo.thumbnail} alt="Thumbnail" />
              </div>
              
              <p className="video-title-text">
                <span style={{color:'#bd93f9', fontWeight:'bold'}}>Title:</span> {videoInfo.title}
              </p>

              <div className="q-grid">
                {videoInfo.downloads.length > 0 ? (
                  videoInfo.downloads.map((dl, i) => (
                    <a key={i} href={dl.url} target="_blank" rel="noreferrer" className="dl-btn">
                      {dl.type} <span>Link {i+1}</span>
                    </a>
                  ))
                ) : (
                  <p style={{color:'#ff4757', fontSize:'12px'}}>No download links found.</p>
                )}
              </div>

              <button 
                className="back-btn" 
                onClick={() => {setVideoInfo(null); setUrl("");}}
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
