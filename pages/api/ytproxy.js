export const config = {
  runtime: "edge",
};

const ALLOWED_HOST_SUFFIXES = [
  ".savetube.vip",
  ".savetube.me",
  ".googlevideo.com",
  ".tiktokcdn-us.com",
  ".tiktokcdn.com",
  ".fbcdn.net",
];

function isAllowedUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_HOST_SUFFIXES.some((suffix) =>
      parsed.hostname.endsWith(suffix)
    );
  } catch {
    return false;
  }
}

export default async function handler(req) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ status: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const ext = searchParams.get("ext") === "mp3" ? "mp3" : "mp4";
  const title = searchParams.get("title") || "vortex-download";

  if (!url || !isAllowedUrl(url)) {
    return new Response(
      JSON.stringify({ status: false, error: "Invalid or unauthorized download URL" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        referer: "https://yt.savetube.me/",
        origin: "https://yt.savetube.me",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(
        JSON.stringify({ status: false, error: "Failed to fetch file from CDN" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const safeFilename = `${title
      .replace(/[\\/:*?"<>|\r\n]/g, "")
      .trim()
      .slice(0, 80) || "vortex-download"}.${ext}`;

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstream.headers.get("content-type") || (ext === "mp3" ? "audio/mpeg" : "video/mp4")
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(safeFilename)}`
    );

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // Stream එක කෙලින්ම user ගේ browser එකට pass කිරීම (Zero buffering on Vercel)
    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ status: false, error: "Proxy stream error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
