import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Content', contentSchema);
