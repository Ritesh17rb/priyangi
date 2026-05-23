import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api.js';

const STORAGE_KEY = 'priyangi_pari_chat';
const GREETING = {
  role: 'assistant',
  content: 'Heyy bestie! ✨ Main hoon Pari 🌸 Bata, aaj kya scene hai — padhai, gossip, ya thoda chill? 💖',
};

function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    // ignore corrupt storage
  }
  return [GREETING];
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
  }, [messages]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: 999999, behavior: 'smooth' });
  }, [messages, busy, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setBusy(true);
    try {
      const data = await api('/ai/chat', { method: 'POST', auth: false, body: { messages: nextMessages } });
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Oops, abhi thoda network issue aa raha hai 🥺 thodi der mein try karein?' },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function clearChat() {
    setMessages([GREETING]);
  }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            aria-label="Chat with Pari"
            className="fixed bottom-5 right-5 z-[120] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-pink to-purple text-2xl text-white shadow-pinky"
          >
            <motion.span animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
              ✨
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="fixed inset-x-0 bottom-0 z-[120] flex h-[80vh] w-full flex-col overflow-hidden rounded-t-3xl border border-pink-light/50 bg-white shadow-soft sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[560px] sm:w-[380px] sm:rounded-3xl"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-pink to-purple px-4 py-3 text-white">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-white/25 text-xl">✨</div>
              <div className="flex-1 leading-tight">
                <div className="font-display text-lg">Pari</div>
                <div className="text-[11px] text-white/85">your sparkle bestie • always here</div>
              </div>
              <button onClick={clearChat} title="New chat" className="rounded-full px-2 py-1 text-sm hover:bg-white/20">↺</button>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full px-2 py-1 text-lg hover:bg-white/20">✕</button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-pink-pale/40 p-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'rounded-br-md bg-gradient-to-br from-pink to-purple text-white'
                        : 'rounded-bl-md border border-pink-light/50 bg-white text-ink'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-pink-light/50 bg-white px-3 py-2 text-sm text-ink-light">
                    Pari is typing…
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex gap-2 border-t border-pink-light/40 bg-white p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Pari…"
                className="input !py-2 flex-1"
              />
              <button type="submit" disabled={busy || !input.trim()} className="btn-primary !px-4 disabled:opacity-50">
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
