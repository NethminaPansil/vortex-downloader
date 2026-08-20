export default {
  async fetch(request, env, ctx) {
    const reqUrl = new URL(request.url);
    const pathname = reqUrl.pathname;
    const searchParams = reqUrl.searchParams;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ==========================================
    // 1. DOWNLOAD ROUTE (Fix කරපු කොටස)
    // ==========================================
    if (pathname === '/download') {
      const rawUrl = searchParams.get('url');
      const format = searchParams.get('format') || 'mp3';

      if (!rawUrl) {
        return new Response(JSON.stringify({ error: 'Missing download URL' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        // Double-encoded වී ඇත්නම් නිවැරදිව Decode කරගැනීම
        let targetUrl = rawUrl;
        try {
          targetUrl = decodeURIComponent(rawUrl);
        } catch (e) {
          targetUrl = rawUrl;
        }

        // File එක Fetch කිරීම (Blocked වීම වැළැක්වීමට User-Agent එකතු කර ඇත)
        const mediaResponse = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
          },
        });

        if (!mediaResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch media file', status: mediaResponse.status }),
            { status: mediaResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Response Headers සකසා User ට Stream කිරීම
        const responseHeaders = new Headers();
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
        responseHeaders.set('Content-Disposition', `attachment; filename="download.${format}"`);

        return new Response(mediaResponse.body, {
          status: 200,
          headers: responseHeaders,
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: 'Download proxy failed', details: err.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==========================================
    // 2. MAIN ROUTE (ඔයාගේ Original API Logic එක)
    // ==========================================
    const ytUrl = searchParams.get('url');
    const type = searchParams.get('type');

    // Query parameters නැත්නම් Usage එක පෙන්වීම
    if (!ytUrl || !type) {
      return new Response(
        JSON.stringify({
          dev: '@udmodz',
          error: 'Missing required query parameters.',
          usage: {
            video: `${reqUrl.origin}/?url=YOUTUBE_URL&type=vid`,
            audio: `${reqUrl.origin}/?url=YOUTUBE_URL&type=aud`,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      // මෙතනදී Target API එකට Call කර Direct File URL එක ලබාගැනීම
      const isAudio = type === 'aud';
      const targetApiUrl = `https://c.ymcdn.org/api/v2/download?url=${encodeURIComponent(ytUrl)}&type=${type}`;
      
      const apiRes = await fetch(targetApiUrl);
      const data = await apiRes.json();

      // Download Link එක Encode කර Worker Download Route එක හරහා Pass කිරීම
      const rawDownloadUrl = data.url || data.link || "";
      const proxiedDownloadUrl = `${reqUrl.origin}/download?url=${encodeURIComponent(rawDownloadUrl)}&format=${isAudio ? 'mp3' : 'mp4'}`;

      // ඔයාගේ Original Output JSON එක
      const responseData = {
        dev: '@udmodz',
        videoname: data.title || data.videoname || '',
        desc: data.description || data.desc || '',
        thumbnail: data.thumbnail || '',
        links: {
          [isAudio ? '128kbps' : '720p']: proxiedDownloadUrl,
        },
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Failed to process YouTube media', details: err.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};
