import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const download = async () => {
    if (!url) return;

    setLoading(true);
    setData(null);

    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const json = await res.json();
    setLoading(false);
    setData(json);
  };

  return (
    <div className="bg">
      <div className="card">
        <h1 className="title">⚡ VORTEX MUSIC</h1>
        <p className="sub">YouTube to MP3 Downloader</p>

        <input
          className="input"
          placeholder="Paste YouTube URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button className="btn" onClick={download}>
          {loading ? "Processing..." : "Download"}
        </button>

        {data?.status && (
          <div className="result">
            <img src={data.data.thumb} />
            <h3>{data.data.title}</h3>
            <a href={data.data.download} target="_blank">
              ⬇ Download MP3
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        .bg {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle, #0f0f0f, #000);
          color: white;
          font-family: Arial;
        }

        .card {
          width: 350px;
          padding: 25px;
          border-radius: 15px;
          background: rgba(20, 20, 20, 0.9);
          box-shadow: 0 0 25px #00fff2;
          text-align: center;
        }

        .title {
          color: #00fff2;
          text-shadow: 0 0 15px #00fff2;
        }

        .sub {
          font-size: 12px;
          opacity: 0.7;
        }

        .input {
          width: 100%;
          padding: 12px;
          margin-top: 15px;
          border-radius: 8px;
          border: none;
          outline: none;
        }

        .btn {
          margin-top: 15px;
          width: 100%;
          padding: 12px;
          background: #00fff2;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .btn:hover {
          background: #00cfc2;
        }

        .result {
          margin-top: 20px;
        }

        .result img {
          width: 100%;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .result a {
          display: inline-block;
          margin-top: 10px;
          color: #00fff2;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}      </button>

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
