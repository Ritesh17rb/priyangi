import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nickname: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    instagram: { type: String, default: '' },
    snapchat: { type: String, default: '' },
    birthday: { type: Date },
    school: { type: String, default: '' },
    notes: { type: String, default: '' },
    favorite: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

contactSchema.index({ owner: 1, name: 1 });

export default mongoose.model('Contact', contactSchema);
