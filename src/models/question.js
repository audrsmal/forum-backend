import mongoose from "mongoose";

const schema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  topic: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

export default mongoose.model("Question", schema);
