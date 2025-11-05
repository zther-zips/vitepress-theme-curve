module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const key = process.env.MOONSHOT_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: 'API key not configured' });

  const { messages } = req.body || {};
  try {
    const resp = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-k2-0905-preview', // 根据你的权限调整
        messages,
        max_tokens: 800,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Moonshot 错误:', resp.status, errText);
      return res.status(500).json({ error: 'Remote API error', detail: errText });
    }

    const data = await resp.json();
    const reply =
      data.reply ||
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      '(baka 没有回应喵…)';
    res.json({ reply, raw: data });
  } catch (e) {
    console.error('Server error:', e);
    res.status(500).json({ error: 'Server error' });
  }
};