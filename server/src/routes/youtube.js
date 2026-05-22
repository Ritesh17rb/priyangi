import { Router } from 'express';

const router = Router();

const SEARCH_MARKERS = ['var ytInitialData = ', 'window["ytInitialData"] = '];

function extractJsonBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return null;

  const start = source.indexOf('{', markerIndex);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) {
      return source.slice(start, i + 1);
    }
  }

  return null;
}

function parseInitialData(html) {
  for (const marker of SEARCH_MARKERS) {
    const block = extractJsonBlock(html, marker);
    if (block) return JSON.parse(block);
  }
  throw new Error('Could not read YouTube search results.');
}

function walk(node, visitor) {
  if (!node || typeof node !== 'object') return;
  visitor(node);

  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, visitor));
    return;
  }

  Object.values(node).forEach((value) => walk(value, visitor));
}

function getText(part) {
  if (!part) return '';
  if (typeof part.simpleText === 'string') return part.simpleText;
  if (Array.isArray(part.runs)) return part.runs.map((run) => run.text || '').join('').trim();
  return '';
}

function pickThumbnail(thumbnails = []) {
  if (!Array.isArray(thumbnails) || thumbnails.length === 0) return '';
  return thumbnails[thumbnails.length - 1]?.url || thumbnails[0]?.url || '';
}

function collectVideos(data) {
  const items = [];
  const seen = new Set();

  walk(data, (node) => {
    const video = node?.videoRenderer;
    if (!video?.videoId || seen.has(video.videoId)) return;

    seen.add(video.videoId);
    items.push({
      id: video.videoId,
      title: getText(video.title) || 'Untitled video',
      channel: getText(video.ownerText) || getText(video.longBylineText) || 'YouTube creator',
      duration: getText(video.lengthText),
      views: getText(video.viewCountText),
      published: getText(video.publishedTimeText),
      thumbnail: pickThumbnail(video.thumbnail?.thumbnails),
    });
  });

  return items;
}

async function fetchSearchHtml(query) {
  const url = new URL('https://www.youtube.com/results');
  url.searchParams.set('search_query', query);
  url.searchParams.set('hl', 'en');
  url.searchParams.set('gl', 'US');

  const response = await fetch(url, {
    headers: {
      'accept-language': 'en-US,en;q=0.9',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`YouTube search failed with HTTP ${response.status}.`);
  }

  return response.text();
}

router.get('/search', async (req, res, next) => {
  const query = String(req.query.q || '').trim();

  if (query.length < 2) {
    return res.status(400).json({ error: 'Search term must be at least 2 characters.' });
  }

  try {
    const html = await fetchSearchHtml(query);
    const data = parseInitialData(html);
    const results = collectVideos(data).slice(0, 12);
    return res.json({ query, results });
  } catch (error) {
    return next(error);
  }
});

export default router;
