import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    setLoading(false);

    setResult(data);
  };

  return (
    <div className="container">
      <h1 className="title">⚡ VORTEX MUSIC DOWNLOADER</h1>

      <input
        placeholder="Paste YouTube link..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="input"
      />

      <button onClick={download} className="btn">
        {loading ? "Processing..." : "Download"}
      </button>

      {result?.status && (
        <div className="card">
          <img src={result.data.thumb} className="thumb" />
          <h3>{result.data.title}</h3>
          <a href={result.data.download} target="_blank" className="dl">
            ⬇ Download MP3
          </a>
        </div>
      )}
    </div>
  );
}
