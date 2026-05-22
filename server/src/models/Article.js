import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, default: '' },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    category: {
      type: String,
      enum: ['article', 'study', 'school', 'diary'],
      default: 'article',
    },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

articleSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model('Article', articleSchema);
