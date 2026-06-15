import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

// 关闭开关：在 .env 里设置 BAKA_ENABLED=false 即可关闭
const ENABLED = process.env.BAKA_ENABLED !== 'false';

const app = express();
app.use(express.json());

const PORT = process.env.BAKA_PORT || 3001;
const KEY = process.env.MOONSHOT_API_KEY || process.env.OPENAI_API_KEY;

if (!ENABLED) {
  console.log('🚫 Baka AI 已被禁用（BAKA_ENABLED=false）');
}

if (!KEY && ENABLED) {
  console.warn('WARN: MOONSHOT_API_KEY / OPENAI_API_KEY 未设置，/api/baka 将返回 500');
}

app.post('/api/baka', async (req, res) => {
  // 如果禁用了，直接返回提示
  if (!ENABLED) {
    return res.status(503).json({ 
      error: 'Baka AI 当前已禁用',
      tip: '如需启用，请设置 BAKA_ENABLED=true 并重启服务'
    });
  }

  try {
    const messages = req.body?.messages || [];
    if (!KEY) return res.status(500).json({ error: 'API key 未配置' });

    const resp = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-k2-0905-preview', // 根据权限调整
        messages,
        max_tokens: 800,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Moonshot error:', resp.status, errText);
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
});

app.listen(PORT, () => {
  if (ENABLED) {
    console.log(`Baka proxy running at http://localhost:${PORT}/api/baka`);
  } else {
    console.log(`Baka proxy 运行中，但 AI 功能已禁用 http://localhost:${PORT}/api/baka`);
  }
});
