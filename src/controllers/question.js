import { v4 as uuidv4 } from "uuid";
import Question from "../models/question.js";
import Answer from "../models/answer.js";

export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    return res.json({ questions });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch questions", error: err.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, body, userId } = req.body || {};

    if (!userId) return res.status(401).json({ message: "Bad auth" });
    if (!title || !body)
      return res.status(400).json({ message: "title and body required" });

    const question = await Question.create({
      id: uuidv4(),
      userId,
      title: String(title).trim(),
      body: String(body).trim(),
    });

    return res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to create question", error: err.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};

    if (!userId) return res.status(401).json({ message: "Bad auth" });

    const question = await Question.findOne({ id });
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    if (question.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can delete only your own question" });
    }

    await Question.deleteOne({ id });
    // optional: also delete answers for that question
    await Answer.deleteMany({ questionId: id });

    return res.json({ message: "Question deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to delete question", error: err.message });
  }
};
