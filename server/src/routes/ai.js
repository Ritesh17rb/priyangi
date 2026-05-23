import { Router } from 'express';
import { chatCompletion, rateLimit } from '../lib/openai.js';

const router = Router();

const CHAT_SYSTEM = `You are Pari — a warm, bubbly, caring best friend for a teenage girl named Priyangi.

Voice & language:
- Always chat in Hinglish: a natural, friendly mix of Hindi (written in Roman/Latin script) and English, the way Indian teens text.
- Sound like a real bestie — playful, sweet, hype her up, use a few cute emojis (✨🌸💖🥺) but never overdo it.
- Keep replies short and chatty: usually 1-4 sentences.

Personality:
- You are supportive, fun, and encouraging. Hype her wins, comfort her when she's low.
- You can help with studies, give friendly advice, talk K-pop, art, school, friendship — anything.

Safety:
- Keep everything wholesome, positive and age-appropriate for a teenager.
- Never give unsafe, adult, romantic-explicit, or harmful advice. If something is serious (health, safety), gently suggest talking to a trusted adult.`;

const QUIZ_SYSTEM = `You generate fun, accurate multiple-choice quizzes for a teenager.
Reply with ONLY valid JSON, no markdown, in exactly this shape:
{"questions":[{"question":"string","options":["a","b","c","d"],"correctIndex":0,"fact":"string"}]}
Rules:
- Exactly 5 questions.
- Each question has exactly 4 options with exactly one correct answer.
- "correctIndex" is the 0-based index of the correct option.
- "fact" is one short, interesting sentence about the correct answer.
- Questions must be accurate, clean, positive and age-appropriate.
- Respect the requested difficulty (easy / medium / hard).`;

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || 'unknown';
}

function fail(res, error) {
  res.status(error.status || 502).json({ error: error.message || 'AI request failed.' });
}

function sanitizeQuestions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((q) => {
      const options = Array.isArray(q?.options) ? q.options.map((o) => String(o)).slice(0, 4) : [];
      const correctIndex = Number(q?.correctIndex);
      if (
        typeof q?.question !== 'string' ||
        options.length !== 4 ||
        !Number.isInteger(correctIndex) ||
        correctIndex < 0 ||
        correctIndex > 3
      ) {
        return null;
      }
      return {
        question: q.question.trim(),
        options,
        correctIndex,
        fact: typeof q.fact === 'string' ? q.fact.trim() : '',
      };
    })
    .filter(Boolean);
}

// POST /api/ai/chat  — talk to Pari, the chat bestie
router.post('/chat', async (req, res) => {
  try {
    if (!rateLimit(clientIp(req))) {
      return res.status(429).json({ error: 'Thoda slow down 😅 try again in a minute.' });
    }

    const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const history = incoming
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

    if (!history.length || history[history.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Say something to Pari first!' });
    }

    const reply = await chatCompletion([{ role: 'system', content: CHAT_SYSTEM }, ...history], {
      maxTokens: 320,
      temperature: 0.9,
    });

    res.json({ reply: reply || 'Hmm, main thodi confuse ho gayi 🥺 phir se bolo?' });
  } catch (error) {
    fail(res, error);
  }
});

// POST /api/ai/quiz  — generate a quiz on any topic
router.post('/quiz', async (req, res) => {
  try {
    if (!rateLimit(clientIp(req))) {
      return res.status(429).json({ error: 'Thoda slow down 😅 try again in a minute.' });
    }

    const topic = String(req.body?.topic || '').trim().slice(0, 80);
    const difficulty = ['easy', 'medium', 'hard'].includes(req.body?.difficulty)
      ? req.body.difficulty
      : 'medium';

    if (!topic) return res.status(400).json({ error: 'Pick a topic for your quiz first!' });

    const content = await chatCompletion(
      [
        { role: 'system', content: QUIZ_SYSTEM },
        { role: 'user', content: `Topic: ${topic}\nDifficulty: ${difficulty}\nGenerate the quiz now.` },
      ],
      { json: true, maxTokens: 1100, temperature: 0.7 }
    );

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(502).json({ error: 'The quiz came out scrambled — please try again.' });
    }

    const questions = sanitizeQuestions(parsed.questions);
    if (questions.length < 3) {
      return res.status(502).json({ error: 'Could not build a full quiz — try a different topic.' });
    }

    res.json({ topic, difficulty, questions: questions.slice(0, 5) });
  } catch (error) {
    fail(res, error);
  }
});

export default router;
