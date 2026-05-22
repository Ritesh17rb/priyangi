import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    endDate: { type: Date },
    color: { type: String, default: '#FF6B9D' },
    category: {
      type: String,
      enum: ['school', 'study', 'personal', 'birthday', 'holiday', 'other'],
      default: 'personal',
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ owner: 1, date: 1 });

export default mongoose.model('Event', eventSchema);
