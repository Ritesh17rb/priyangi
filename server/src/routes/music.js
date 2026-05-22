import { Router } from 'express';
import MusicTrack from '../models/MusicTrack.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const extractYouTubeId = (input) => {
  if (!input) return '';
  if (input.length === 11 && !input.includes('/')) return input;
  const m = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : input;
};

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.group) filter.group = req.query.group;
  if (req.query.genre) filter.genre = req.query.genre;
  const tracks = await MusicTrack.find(filter).sort({ createdAt: -1 });
  res.json(tracks);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, artist, group, genre, youtubeId, coverImage, notes } = req.body;
    if (!title || !artist || !youtubeId)
      return res.status(400).json({ error: 'title, artist, youtubeId required' });
    const track = await MusicTrack.create({
      title,
      artist,
      group: group || '',
      genre: genre || 'K-Pop',
      youtubeId: extractYouTubeId(youtubeId),
      coverImage: coverImage || '',
      notes: notes || '',
      addedBy: req.user._id,
    });
    res.json(track);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const body = { ...req.body };
  if (body.youtubeId) body.youtubeId = extractYouTubeId(body.youtubeId);
  const track = await MusicTrack.findByIdAndUpdate(req.params.id, body, { new: true });
  res.json(track);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await MusicTrack.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

const SEED_TRACKS = [
  // BLACKPINK
  { title: 'DDU-DU DDU-DU', artist: 'BLACKPINK', group: 'BLACKPINK', genre: 'K-Pop', youtubeId: 'IHNzOHi8sJs' },
  { title: 'Kill This Love', artist: 'BLACKPINK', group: 'BLACKPINK', genre: 'K-Pop', youtubeId: '2S24-y0Ij3Y' },
  { title: 'How You Like That', artist: 'BLACKPINK', group: 'BLACKPINK', genre: 'K-Pop', youtubeId: 'ioNng23DkIM' },
  { title: 'Pink Venom', artist: 'BLACKPINK', group: 'BLACKPINK', genre: 'K-Pop', youtubeId: 'gQlMMD8auMs' },
  { title: 'Shut Down', artist: 'BLACKPINK', group: 'BLACKPINK', genre: 'K-Pop', youtubeId: 'POe9SOEKotk' },
  { title: 'Lovesick Girls', artist: 'BLACKPINK', group: 'BLACKPINK', genre: 'K-Pop', youtubeId: 'dyRsYk0LyA8' },
  { title: 'Boombayah', artist: 'BLACKPINK', group: 'BLACKPINK', genre: 'K-Pop', youtubeId: 'bwmSjveL3Lc' },
  { title: 'As If It\'s Your Last', artist: 'BLACKPINK', group: 'BLACKPINK', genre: 'K-Pop', youtubeId: 'Amq-qlqbjYA' },
  // BTS
  { title: 'Dynamite', artist: 'BTS', group: 'BTS', genre: 'K-Pop', youtubeId: 'gdZLi9oWNZg' },
  { title: 'Butter', artist: 'BTS', group: 'BTS', genre: 'K-Pop', youtubeId: 'WMweEpGlu_U' },
  { title: 'Boy With Luv', artist: 'BTS feat. Halsey', group: 'BTS', genre: 'K-Pop', youtubeId: 'XsX3ATc3FbA' },
  { title: 'DNA', artist: 'BTS', group: 'BTS', genre: 'K-Pop', youtubeId: 'MBdVXkSdhwU' },
  { title: 'Permission to Dance', artist: 'BTS', group: 'BTS', genre: 'K-Pop', youtubeId: 'CuklIb9d3fI' },
  // TWICE
  { title: 'Fancy', artist: 'TWICE', group: 'TWICE', genre: 'K-Pop', youtubeId: 'kOHB85vDuow' },
  { title: 'Feel Special', artist: 'TWICE', group: 'TWICE', genre: 'K-Pop', youtubeId: '3ymwOvzhwHs' },
  { title: 'TT', artist: 'TWICE', group: 'TWICE', genre: 'K-Pop', youtubeId: 'ePpPVE-GGJw' },
  { title: 'What Is Love?', artist: 'TWICE', group: 'TWICE', genre: 'K-Pop', youtubeId: 'i0p1bmr0EmE' },
  // NewJeans
  { title: 'Hype Boy', artist: 'NewJeans', group: 'NewJeans', genre: 'K-Pop', youtubeId: 'Uh-Q0YaWHIE' },
  { title: 'Super Shy', artist: 'NewJeans', group: 'NewJeans', genre: 'K-Pop', youtubeId: 'ArmDp-zijuc' },
  { title: 'OMG', artist: 'NewJeans', group: 'NewJeans', genre: 'K-Pop', youtubeId: 'sVTy_wmn5SU' },
  // IVE
  { title: 'I AM', artist: 'IVE', group: 'IVE', genre: 'K-Pop', youtubeId: '6ZUIwj3FgUY' },
  { title: 'LOVE DIVE', artist: 'IVE', group: 'IVE', genre: 'K-Pop', youtubeId: 'Y8JFxS1HlDo' },
  { title: 'After LIKE', artist: 'IVE', group: 'IVE', genre: 'K-Pop', youtubeId: 'F0B7HDiY-10' },
  // aespa
  { title: 'Next Level', artist: 'aespa', group: 'aespa', genre: 'K-Pop', youtubeId: '4TWR90KJl84' },
  { title: 'Black Mamba', artist: 'aespa', group: 'aespa', genre: 'K-Pop', youtubeId: 'ZeerrnuLi5E' },
  // LE SSERAFIM
  { title: 'ANTIFRAGILE', artist: 'LE SSERAFIM', group: 'LE SSERAFIM', genre: 'K-Pop', youtubeId: 'pyf8cbqyfPs' },
  { title: 'FEARLESS', artist: 'LE SSERAFIM', group: 'LE SSERAFIM', genre: 'K-Pop', youtubeId: 'JpgaqA9ETsA' },
  // ITZY
  { title: 'WANNABE', artist: 'ITZY', group: 'ITZY', genre: 'K-Pop', youtubeId: 'O8pT0jakbf8' },
  // (G)I-DLE
  { title: 'TOMBOY', artist: '(G)I-DLE', group: '(G)I-DLE', genre: 'K-Pop', youtubeId: 'tdM9FRTpQAA' },
  // Red Velvet
  { title: 'Psycho', artist: 'Red Velvet', group: 'Red Velvet', genre: 'K-Pop', youtubeId: 'uR8Mrt1IpXg' },
];

router.post('/seed', requireAuth, requireAdmin, async (req, res) => {
  try {
    const results = { added: 0, skipped: 0 };
    for (const t of SEED_TRACKS) {
      const exists = await MusicTrack.findOne({ youtubeId: t.youtubeId });
      if (exists) { results.skipped++; continue; }
      await MusicTrack.create({ ...t, addedBy: req.user._id });
      results.added++;
    }
    res.json({ ok: true, ...results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/favorite', requireAuth, async (req, res) => {
  const track = await MusicTrack.findById(req.params.id);
  if (!track) return res.status(404).json({ error: 'Not found' });
  const i = track.favoritedBy.findIndex((u) => u.equals(req.user._id));
  if (i >= 0) track.favoritedBy.splice(i, 1);
  else track.favoritedBy.push(req.user._id);
  await track.save();
  res.json({ favorites: track.favoritedBy.length, favorited: i < 0 });
});

export default router;
