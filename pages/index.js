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
            thumbnail: json.result.thumbnail,
            isTikTok: true,
            downloads: json.result.downloads
          });
        } else {
          alert("TikTok Error: " + json.result);
        }
      } else {
        if (json.status) {
          setVideoInfo({
            title: json.data.title,
            thumbnail: json.data.thumbnail || json.data.thumb,
            isTikTok: false
          });
        } else {
          alert("YouTube Error: Invalid link or server issue");
        }
      }
    } catch (error) {
      alert("System Error: Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Head>
        <title>Vortex Multi-Downloader</title>
        <meta name="referrer" content="no-referrer" /> {/* TikTok Thumbnail සදහා වැදගත් */}
      </Head>

      <div className="main-wrapper">
        <style dangerouslySetInnerHTML={{ __html: `
          .main-wrapper {
            min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px;
            background: linear-gradient(rgba(10, 5, 20, 0.85), rgba(10, 5, 20, 0.85)), 
                        url('https://pmd-img2url.koyeb.app/v/37b283cde9b2b713cccf287a39212e37.jpg');
            background-size: cover; background-position: center; background-attachment: fixed;
          }
          @media (max-width: 768px) {
            .main-wrapper { 
              background-image: linear-gradient(rgba(10, 5, 20, 0.85), rgba(10, 5, 20, 0.85)), 
                                url('https://pmd-img2url.koyeb.app/v/d298774c05692f31633940598b648509.jpg'); 
            }
          }
          .glass-card {
            background: rgba(25, 15, 40, 0.7); backdrop-filter: blur(15px);
            border: 1px solid rgba(189, 147, 249, 0.3); padding: 30px; border-radius: 25px;
            width: 100%; max-width: 400px; text-align: center; color: white;
          }
          .thumb-frame {
            width: 100%; border-radius: 15px; border: 2px solid #bd93f9; 
            margin: 20px 0; overflow: hidden; box-shadow: 0 0 15px rgba(189, 147, 249, 0.5);
          }
          .thumb-img { width: 100%; display: block; }
          .q-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
          .q-btn { 
            padding: 10px; background: #6c5ce7; border: none; color: white; 
            border-radius: 8px; font-size: 11px; cursor: pointer; text-decoration: none;
          }
        `}} />

        <div className="glass-card">
          <h1 style={{fontFamily:'Orbitron', color:'#bd93f9'}}>VORTEX</h1>
          
          {!videoInfo ? (
            <>
              <input 
                style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #444', background:'#000', color:'#fff'}}
                placeholder="Paste Link..." value={url} onChange={e => setUrl(e.target.value)} 
              />
              <button 
                style={{width:'100%', padding:'12px', marginTop:'15px', borderRadius:'10px', background:'#bd93f9', border:'none', fontWeight:'bold'}}
                onClick={analyzeLink} disabled={loading}
              >
                {loading ? "ANALYZING..." : "ANALYZE LINK"}
              </button>
            </>
          ) : (
            <div>
              <div className="thumb-frame">
                <img className="thumb-img" src={videoInfo.thumbnail} alt="Preview" referrerPolicy="no-referrer" />
              </div>
              <p style={{fontSize:'13px', textAlign:'left'}}><b>Title:</b> {videoInfo.title}</p>
              
              <div className="q-grid">
                {videoInfo.isTikTok ? (
                  videoInfo.downloads.map((dl, i) => (
                    <a key={i} href={dl.url} target="_blank" className="q-btn">{dl.type}</a>
                  ))
                ) : (
                  <button className="q-btn" onClick={() => {/* Download Logic */}}>MP3 Audio</button>
                )}
              </div>
              <button onClick={() => setVideoInfo(null)} style={{marginTop:'20px', color:'#ff4757', background:'none', border:'none'}}>← BACK</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
