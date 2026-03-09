import mongoose from "mongoose";

const schema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  targetType: { type: String, required: true }, // "question" | "answer"
  targetId: { type: String, required: true },
  value: { type: Number, required: true }, // 1 or -1
});

schema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model("Vote", schema);
