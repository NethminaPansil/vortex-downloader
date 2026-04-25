import { useState } from "react";
import Head from "next/head";

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
        <title>Vortex Music | Downloader</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="main-wrapper">
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Poppins', sans-serif;
            background-color: #05010a; /* Fallback color */
          }

          .main-wrapper {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            /* Default: PC Background */
            background-image: linear-gradient(rgba(5, 1, 10, 0.7), rgba(5, 1, 10, 0.7)), url('https://pmd-img2url.koyeb.app/v/37b283cde9b2b713cccf287a39212e37.jpg');
          }

          /* Mobile Screen එකකදී Background එක වෙනස් කිරීම */
          @media (max-width: 768px) {
            .main-wrapper {
              background-image: linear-gradient(rgba(5, 1, 10, 0.7), rgba(5, 1, 10, 0.7)), url('https://pmd-img2url.koyeb.app/v/d298774c05692f31633940598b648509.jpg');
            }
          }

          .glass-card {
            background: rgba(15, 2, 25, 0.6); /* කලු දම් පාට Glass effect එක */
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(138, 43, 226, 0.2);
            padding: 40px 30px;
            border-radius: 35px;
            width: 100%;
            max-width: 420px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(138, 43, 226, 0.1);
          }

          .vortex-title {
            font-family: 'Orbitron', sans-serif;
            color: #bd93f9; /* දම් පාට Glow එක */
            font-size: 38px;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin: 0;
            text-shadow: 0 0 15px rgba(189, 147, 249, 0.8);
          }

          .sub-title {
            color: #a29bfe;
            font-size: 13px;
            margin-bottom: 30px;
            letter-spacing: 1px;
            opacity: 0.8;
          }

          .input-glass {
            width: 100%;
            padding: 16px;
            margin-bottom: 20px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(138, 43, 226, 0.3);
            border-radius: 15px;
            color: #efefef;
            outline: none;
            box-sizing: border-box;
            transition: 0.3s;
          }

          .input-glass:focus {
            border-color: #bd93f9;
            box-shadow: 0 0 10px rgba(189, 147, 249, 0.3);
          }

          .btn-neon {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #6c5ce7, #a29bfe);
            border: none;
            border-radius: 15px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: 0.3s;
            box-shadow: 0 10px 20px rgba(108, 92, 231, 0.3);
          }

          .btn-neon:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(108, 92, 231, 0.5);
          }

          .result-card {
            margin-top: 30px;
            padding-top: 25px;
            border-top: 1px solid rgba(138, 43, 226, 0.2);
          }

          .thumb-frame {
            width: 100%;
            padding: 8px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 20px;
            border: 1px solid rgba(138, 43, 226, 0.3);
            margin-bottom: 15px;
            box-sizing: border-box;
          }

          .thumb-img {
            width: 100%;
            border-radius: 14px;
            display: block;
          }

          .video-title {
            color: #eee;
            font-size: 14px;
            margin: 10px 0 20px 0;
            text-align: left;
            line-height: 1.4;
          }

          .video-title span {
            color: #bd93f9;
            font-weight: 600;
            margin-right: 5px;
          }

          .download-link {
            color: #f8a5c2;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: 0.3s;
          }

          .download-link:hover {
            color: #fff;
            text-shadow: 0 0 10px #f8a5c2;
          }
        `}} />

        <div className="glass-card">
          <h1 className="vortex-title">VORTEX</h1>
          <p className="sub-title">PREMIUM MP3 DOWNLOADER</p>

          <input
            className="input-glass"
            placeholder="Paste YouTube Link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button className="btn-neon" onClick={download} disabled={loading}>
            {loading ? "Processing..." : "Download MP3"}
          </button>

          {data?.status && (
            <div className="result-card">
              <div className="thumb-frame">
                <img className="thumb-img" src={data.data.thumb} alt="thumb" />
              </div>

              <p className="video-title">
                <span>Title:</span> {data.data.title}
              </p>

              <a className="download-link" href={data.data.download} target="_blank" rel="noreferrer">
                ⬇ DOWNLOAD AUDIO
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
