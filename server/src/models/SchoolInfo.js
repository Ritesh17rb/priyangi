import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    singleton: { type: Number, default: 1, unique: true },
    name: { type: String, default: "Priyangi's School" },
    tagline: { type: String, default: 'Where dreams take flight ✨' },
    motto: { type: String, default: 'Knowledge · Kindness · Courage' },
    founded: { type: String, default: '' },
    address: { type: String, default: '' },
    principal: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    photos: [{ type: String }],
    achievements: [{ type: String }],
    facilities: [{ type: String }],
    favoriteTeachers: [
      {
        name: String,
        subject: String,
        note: String,
      },
    ],
    bestMemories: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('SchoolInfo', schoolSchema);
