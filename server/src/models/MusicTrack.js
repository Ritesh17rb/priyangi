import mongoose from 'mongoose';

const musicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    group: { type: String, default: '' },
    genre: { type: String, default: 'K-Pop' },
    youtubeId: { type: String, required: true },
    coverImage: { type: String, default: '' },
    notes: { type: String, default: '' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('MusicTrack', musicSchema);
