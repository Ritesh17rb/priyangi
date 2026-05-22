import mongoose from 'mongoose';

// Stores an uploaded image's raw bytes in MongoDB so it survives on
// serverless hosts (Vercel) where the local filesystem is not persistent.
const uploadSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Upload', uploadSchema);
