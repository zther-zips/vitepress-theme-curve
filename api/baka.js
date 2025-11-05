export default async function handler(req, res) {
  const errorId = `err-${Date.now().toString(36)}`;
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const key = process.env.MOONSHOT_API_KEY || process.env.OPENAI_API_KEY;
    if (!key) {
      console.error(`[${errorId}] API key not configured`);
      return res.status(500).json({ error: 'Server configuration error', id: errorId });
    }

    // 兼容 req.body 未解析的情况（更健壮）
    let body = req.body;
    if (!body) {
      try {
        const raw = await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', (c) => (data += c));
          req.on('end', () => resolve(data));
          req.on('error', reject);
        });
        body = raw ? JSON.parse(raw) : {};
      } catch (e) {
        console.error(`[${errorId}] parse body failed:`, e);
        return res.status(400).json({ error: 'Bad Request', id: errorId });
      }
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length) {
      return res.status(400).json({ error: 'messages required', id: errorId });
    }

    const resp = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-k2-0905-preview',
        messages,
        max_tokens: 800,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '<no body>');
      console.error(`[${errorId}] Moonshot error:`, resp.status, errText);
      return res.status(500).json({ error: 'Remote API error', id: errorId });
    }

    const data = await resp.json().catch((e) => {
      console.error(`[${errorId}] parse remote json failed:`, e);
      return null;
    });

    const reply =
      data?.reply ||
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      '(baka 没有回应喵…)';

    return res.status(200).json({ reply, raw: data });
  } catch (e) {
    console.error(`[${errorId}] Unhandled error:`, e);
    return res.status(500).json({ error: 'Server error', id: errorId });
  }
}