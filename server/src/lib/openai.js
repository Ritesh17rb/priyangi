// Thin wrapper around the OpenAI Chat Completions API.
// The API key lives only in process.env.OPENAI_API_KEY — never in code.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

export async function chatCompletion(messages, { json = false, maxTokens = 500, temperature = 0.8 } = {}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const err = new Error('AI is not set up yet — add OPENAI_API_KEY on the server.');
    err.status = 503;
    throw err;
  }

  const body = {
    model: MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  };
  if (json) body.response_format = { type: 'json_object' };

  let res;
  try {
    res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    const err = new Error('Could not reach the AI right now. Please try again.');
    err.status = 502;
    throw err;
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('OpenAI error', res.status, detail.slice(0, 300));
    const err = new Error(
      res.status === 401
        ? 'The AI key is invalid. Please check OPENAI_API_KEY.'
        : res.status === 429
        ? 'The AI is a little busy — try again in a moment.'
        : 'The AI request failed. Please try again.'
    );
    err.status = res.status === 429 ? 429 : res.status === 401 ? 500 : 502;
    throw err;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// Lightweight in-memory per-IP rate limit. Best-effort on serverless,
// but it blunts bursts; pair it with a spend cap on the OpenAI account.
const hits = new Map();

export function rateLimit(ip, max = 25, windowMs = 60000) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}
