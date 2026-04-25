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
      console.error("Error fetching download:", error);
      alert("වැරැද්දක් සිදුවුණා! නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-container">
      {/* ප්‍රධාන Glassy Card එක */}
      <div className="glass-card">
        <h1 className="title">⚡ Vortex Music</h1>
        <p style={{ opacity: 0.7, fontSize: "14px", marginTop: "-10px" }}>
          YouTube to MP3 Downloader
        </p>

        <input
          className="input-glass"
          type="text"
          placeholder="Paste YouTube link here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button className="btn-neon" onClick={download} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              &nbsp; Processing...
            </>
          ) : (
            "Download MP3"
          )}
        </button>

        {/* Result area (ප්‍රතිඵලය) */}
        {data && data.status && (
          <div className="result-card">
            <img 
              className="thumb-img" 
              src={data.data.thumb} 
              alt="Video Thumbnail" 
            />
            <h3 style={{ fontSize: "16px", margin: "10px 0", color: "#ddd" }}>
              {data.data.title}
            </h3>
            <a 
              className="download-link" 
              href={data.data.download} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              ⬇ Click here to Download
            </a>
          </div>
        )}
      </div>

      {/* Loading Spinner එකක් සඳහා (CSS optional) */}
      <style jsx global>{`
        .spinner-border {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          vertical-align: -0.125em;
          border: 0.2em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spinner-border .75s linear infinite;
        }
        @keyframes spinner-border {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
