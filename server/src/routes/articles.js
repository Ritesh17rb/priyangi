import { Router } from 'express';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { uploadImage, saveUpload, deleteUpload } from '../lib/imageStore.js';

const router = Router();

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags !== 'string') return [];
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
}

router.get('/', optionalAuth, async (req, res) => {
  const { category, q } = req.query;
  const filter = { published: true };
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };
  const articles = await Article.find(filter)
    .populate('author', 'name avatar role')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(articles);
});

router.get('/:slug', optionalAuth, async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug }).populate(
    'author',
    'name avatar role'
  );
  if (!article) return res.status(404).json({ error: 'Not found' });
  const comments = await Comment.find({ article: article._id })
    .populate('author', 'name avatar role')
    .sort({ createdAt: 1 });
  res.json({ article, comments });
});

router.post('/', requireAuth, requireAdmin, uploadImage.single('coverImage'), async (req, res) => {
  let coverImage = '';
  try {
    const { title, content, excerpt, category } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });

    coverImage = await saveUpload(req.file);

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let i = 2;
    while (await Article.findOne({ slug })) slug = `${baseSlug}-${i++}`;

    const article = await Article.create({
      title,
      slug,
      content,
      excerpt: excerpt || content.slice(0, 200),
      coverImage,
      category: category || 'article',
      tags: normalizeTags(req.body.tags),
      author: req.user._id,
    });
    res.json(article);
  } catch (e) {
    await deleteUpload(coverImage);
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', requireAuth, requireAdmin, uploadImage.single('coverImage'), async (req, res) => {
  let newCoverImage = '';
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Not found' });

    const previousCoverImage = article.coverImage;

    if (req.body.title?.trim()) article.title = req.body.title.trim();
    if (req.body.content != null) article.content = req.body.content;
    if (req.body.excerpt != null) article.excerpt = req.body.excerpt || article.content.slice(0, 200);
    if (req.body.category) article.category = req.body.category;
    if (req.body.tags != null) article.tags = normalizeTags(req.body.tags);
    if (req.file) {
      newCoverImage = await saveUpload(req.file);
      article.coverImage = newCoverImage;
    }

    await article.save();

    if (newCoverImage && previousCoverImage !== newCoverImage) {
      await deleteUpload(previousCoverImage);
    }

    res.json(article);
  } catch (e) {
    await deleteUpload(newCoverImage);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  await Comment.deleteMany({ article: req.params.id });
  if (article) await deleteUpload(article.coverImage);
  res.json({ ok: true });
});

router.post('/:id/like', requireAuth, async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ error: 'Not found' });
  const i = article.likes.findIndex((u) => u.equals(req.user._id));
  if (i >= 0) article.likes.splice(i, 1);
  else article.likes.push(req.user._id);
  await article.save();
  res.json({ likes: article.likes.length, liked: i < 0 });
});

router.post('/:id/comments', requireAuth, async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'body required' });
  const comment = await Comment.create({
    article: req.params.id,
    author: req.user._id,
    body,
  });
  await comment.populate('author', 'name avatar role');
  res.json(comment);
});

router.delete('/comments/:id', requireAuth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (!comment.author.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await comment.deleteOne();
  res.json({ ok: true });
});

export default router;
