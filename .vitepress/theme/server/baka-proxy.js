import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// --- 新增：简单 CORS 中间件，允许 dev server 发起请求 ---
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:9877";
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  // 如果需要允许携带 cookie，可加入：
  // res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
// --- end CORS 中间件 ---

const PORT = Number(process.env.BAKA_PORT) || 3001;
// 支持多种 env 名称以兼容历史配置
const KEY =
  process.env.MOONSHOT_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.OPENAI_KIMI_API_KEY;

if (!KEY) {
  console.warn("WARN: MOONSHOT_API_KEY / OPENAI_API_KEY 未设置，/api/baka 将返回 500");
}

app.post("/api/baka", async (req, res) => {
  try {
    console.log("[Baka Proxy] incoming request", { url: req.originalUrl, method: req.method });
    const bodyPreview =
      typeof req.body === "object"
        ? { keys: Object.keys(req.body), hasMessages: Array.isArray(req.body.messages) }
        : { rawType: typeof req.body };
    console.log("[Baka Proxy] body preview:", bodyPreview);

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    if (!KEY) return res.status(500).json({ error: "API key 未配置" });
    if (!Array.isArray(messages) || messages.length === 0) {
      console.warn("[Baka Proxy] missing messages in request");
      return res.status(400).json({ error: "messages required" });
    }

    const resp = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "kimi-k2-0905-preview",
        messages,
        max_tokens: 800,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "<no body>");
      console.error("[Baka Proxy] Remote error:", resp.status, errText);
      return res.status(500).json({ error: "Remote API error", detail: errText });
    }

    const data = await resp.json().catch((e) => {
      console.error("[Baka Proxy] parse remote json failed:", e);
      return null;
    });

    const reply =
      data?.reply || data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "(baka 没有回应喵…)";
    res.json({ reply, raw: data });
  } catch (e) {
    const errId = `err-${Date.now().toString(36)}`;
    console.error(`[${errId}] Server error:`, e);
    return res.status(500).json({ error: "Server error", id: errId });
  }
});

app.listen(PORT, () => {
  console.log(`Baka proxy running at http://localhost:${PORT}/api/baka`);
});

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.warn('[Baka Proxy] Invalid JSON body:', err.message);
    return res.status(400).json({ error: 'Invalid JSON body', detail: err.message });
  }
  // 兼容 body-parser 的 SyntaxError 情况
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.warn('[Baka Proxy] SyntaxError parsing JSON:', err.message);
    return res.status(400).json({ error: 'Invalid JSON body', detail: err.message });
  }
  next(err);
});