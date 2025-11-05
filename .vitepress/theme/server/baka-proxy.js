const express = require('express');
require('dotenv').config();
const app = express();
app.use(express.json());

const PORT = process.env.BAKA_PORT || 3001;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.warn('WARN: OPENAI_KIMI_API_KEY 未设置，/api/baka 将返回 500');
}

app.post('/api/baka', async (req, res) => {
  try {
    const messages = req.body.messages || [];
    if (!OPENAI_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY 未配置' });

    const resp = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kimi-k2-0905-preview', // 可换成你有权限的模型
        messages,
        max_tokens: 800,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('OpenAI 错误:', resp.status, errText);
      return res.status(500).json({ error: 'OpenAI API 错误', detail: errText });
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || '(baka 没有回应喵…)';
    res.json({ reply, raw: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.listen(PORT, () => {
  console.log(`Baka proxy running at http://localhost:${PORT}/api/baka`);
});