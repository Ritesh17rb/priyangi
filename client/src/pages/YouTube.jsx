import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api.js';
import { useAlerts } from '../components/AlertProvider.jsx';

const QUICK_PICKS = [
  { id: 'IHNzOHi8sJs', title: 'BLACKPINK - DDU-DU DDU-DU', emoji: 'Love' },
  { id: 'gdZLi9oWNZg', title: 'BTS - Dynamite', emoji: 'Mic' },
  { id: 'Uh-Q0YaWHIE', title: 'NewJeans - Hype Boy', emoji: 'Bloom' },
  { id: '6ZUIwj3FgUY', title: 'IVE - I AM', emoji: 'Glow' },
  { id: 'pyf8cbqyfPs', title: 'LE SSERAFIM - ANTIFRAGILE', emoji: 'Fire' },
  { id: '4TWR90KJl84', title: 'aespa - Next Level', emoji: 'Wave' },
  { id: 'tdM9FRTpQAA', title: '(G)I-DLE - TOMBOY', emoji: 'Ribbon' },
  { id: 'kOHB85vDuow', title: 'TWICE - Fancy', emoji: 'Berry' },
];

const PLAYLISTS = [
  { id: 'PLwLSw1_eDZl3CKlZqUTLLi5Y9G_3oHlfp', label: 'BLACKPINK Hits' },
  { id: 'PLp23z6Z6vPCGEbF7XDi8L_VOUCNdOHWqi', label: 'K-Pop Mix' },
];

const SEARCH_SUGGESTIONS = [
  'BLACKPINK live',
  'study with me',
  'lofi hip hop',
  'travel vlog',
  'cricket highlights',
  'space documentary',
];

const ID_RE = /(?:v=|youtu\.be\/|embed\/|shorts\/|\/v\/)([A-Za-z0-9_-]{11})/;
const PLAYLIST_RE = /list=([A-Za-z0-9_-]+)/;
const HISTORY_KEY = 'priyangi_yt_history';

function parse(input) {
  if (!input) return null;
  const trimmed = input.trim();
  const playlistMatch = trimmed.match(PLAYLIST_RE);
  if (playlistMatch) return { type: 'playlist', id: playlistMatch[1] };
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return { type: 'video', id: trimmed };
  const videoMatch = trimmed.match(ID_RE);
  if (videoMatch) return { type: 'video', id: videoMatch[1] };
  return null;
}

export default function YouTubePage() {
  const { notify } = useAlerts();
  const [input, setInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [now, setNow] = useState(QUICK_PICKS[0]);
  const [mode, setMode] = useState('video');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 12)));
  }, [history]);

  function play(id, title = 'Now playing', kind = 'video') {
    setNow({ id, title });
    setMode(kind);
    if (kind === 'video') {
      setHistory((current) => [{ id, title, ts: Date.now() }, ...current.filter((item) => item.id !== id)].slice(0, 12));
    }
  }

  function submit(event) {
    event.preventDefault();
    const parsed = parse(input);
    if (!parsed) {
      notify({
        tone: 'info',
        title: 'Invalid YouTube link',
        message: 'Paste a YouTube video URL, video ID, or playlist URL. Use the search box for topics.',
      });
      return;
    }

    play(parsed.id, input, parsed.type);
    setInput('');
  }

  async function search(topic = searchInput, autoPlay = true) {
    const query = topic.trim();
    if (query.length < 2) {
      notify({
        tone: 'info',
        title: 'Search needs more text',
        message: 'Type at least 2 characters to search YouTube.',
      });
      return;
    }

    setSearching(true);
    try {
      const data = await api(`/youtube/search?q=${encodeURIComponent(query)}`, { auth: false });
      setSearchResults(data.results || []);
      setSearchQuery(data.query || query);

      if (autoPlay && data.results?.[0]) {
        play(data.results[0].id, data.results[0].title, 'video');
      }

      if (!data.results?.length) {
        notify({
          tone: 'info',
          title: 'No results found',
          message: 'Try a broader topic or a different spelling.',
        });
      }
    } catch (error) {
      notify({
        tone: 'danger',
        title: 'Search failed',
        message: error.message || 'Could not search YouTube right now.',
      });
    } finally {
      setSearching(false);
    }
  }

  const src =
    mode === 'playlist'
      ? `https://www.youtube.com/embed/videoseries?list=${now.id}&autoplay=1`
      : `https://www.youtube.com/embed/${now.id}?autoplay=1`;

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <h1 className="section-title !mb-1 text-left">My <span className="shimmer-text">YouTube</span></h1>
      <p className="mb-6 text-ink-light">Paste any YouTube link, or search any topic and play it right here.</p>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <form onSubmit={submit} className="card flex flex-col gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-pink">Paste a link</div>
            <div className="mt-1 font-display text-2xl text-ink">Instant link player</div>
          </div>
          <input
            className="input flex-1"
            placeholder="Paste YouTube URL, video ID, or playlist URL..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button className="btn-primary md:w-36">Play link</button>
        </form>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            search();
          }}
          className="card flex flex-col gap-3"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-pink">Search YouTube</div>
            <div className="mt-1 font-display text-2xl text-ink">Topic search + autoplay</div>
          </div>
          <input
            className="input flex-1"
            placeholder="Search any topic on YouTube..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {SEARCH_SUGGESTIONS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setSearchInput(topic);
                  search(topic);
                }}
                className="rounded-full border border-pink-light bg-pink-pale px-3 py-1 text-xs font-bold text-pink transition hover:bg-white"
              >
                {topic}
              </button>
            ))}
          </div>
          <button className="btn-purple md:w-36">{searching ? 'Searching...' : 'Search'}</button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div layout className="lg:col-span-2">
          <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-soft">
            <iframe
              key={`${mode}-${now.id}`}
              src={src}
              title={now.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="card mt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-pink">{mode === 'playlist' ? 'Playlist' : 'Now playing'}</div>
            <div className="truncate font-display text-2xl text-ink">{now.title}</div>
            <div className="mt-3 flex gap-2">
              <a
                className="btn-ghost text-sm"
                target="_blank"
                rel="noreferrer"
                href={mode === 'playlist'
                  ? `https://www.youtube.com/playlist?list=${now.id}`
                  : `https://www.youtube.com/watch?v=${now.id}`}
              >
                Open on YouTube
              </a>
              <button
                className="btn-ghost text-sm"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    mode === 'playlist'
                      ? `https://www.youtube.com/playlist?list=${now.id}`
                      : `https://youtu.be/${now.id}`
                  );
                  notify({ tone: 'success', title: 'Copied', message: 'The current YouTube link is in your clipboard.' });
                }}
              >
                Copy link
              </button>
            </div>
          </div>

          <div className="card mt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-pink">Search results</div>
                <div className="font-display text-2xl text-ink">
                  {searchQuery ? `Results for "${searchQuery}"` : 'Search any topic to load playable videos'}
                </div>
              </div>
              {searchQuery && <div className="chip">{searchResults.length} results</div>}
            </div>

            {searchResults.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => play(item.id, item.title)}
                    className="overflow-hidden rounded-2xl border border-pink-light/60 bg-white text-left transition hover:-translate-y-1 hover:shadow-soft"
                  >
                    <img
                      src={item.thumbnail || `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                    <div className="p-3">
                      <div className="font-semibold text-ink">{item.title}</div>
                      <div className="mt-1 text-xs text-ink-light">{item.channel}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider text-pink">
                        {item.duration && <span>{item.duration}</span>}
                        {item.views && <span>{item.views}</span>}
                        {item.published && <span>{item.published}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-pink-light bg-pink-pale/60 p-4 text-sm text-ink-light">
                Search for any topic like music, study sessions, recipes, highlights, or documentaries. The first result auto-plays, and you can switch to any other result below it.
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="card">
            <div className="mb-2 font-display text-xl">Quick picks</div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PICKS.map((pick) => (
                <button
                  key={pick.id}
                  onClick={() => play(pick.id, pick.title)}
                  className="rounded-xl bg-pink-pale p-2 text-left transition hover:bg-pink-light/40"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${pick.id}/mqdefault.jpg`}
                    alt=""
                    className="aspect-video w-full rounded-md object-cover"
                  />
                  <div className="mt-1 truncate text-xs font-bold text-ink">{pick.emoji} {pick.title}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="mb-2 font-display text-xl">Playlists</div>
            <div className="space-y-2">
              {PLAYLISTS.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => play(playlist.id, playlist.label, 'playlist')}
                  className="w-full rounded-xl bg-purple/10 px-3 py-2 text-left font-semibold text-purple transition hover:bg-purple/20"
                >
                  {playlist.label}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="card">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-display text-xl">Recently watched</div>
                <button onClick={() => setHistory([])} className="text-xs font-bold text-pink">Clear</button>
              </div>
              <div className="max-h-64 space-y-1 overflow-auto">
                {history.map((item) => (
                  <button
                    key={item.ts}
                    onClick={() => play(item.id, item.title)}
                    className="w-full truncate rounded-lg px-2 py-1 text-left text-sm transition hover:bg-pink-pale"
                  >
                    {item.title || item.id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
