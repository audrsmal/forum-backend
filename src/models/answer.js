import mongoose from "mongoose";

const schema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  questionId: { type: String, required: true },
  userId: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

export default mongoose.model("Answer", schema);
