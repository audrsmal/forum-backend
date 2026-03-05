import { v4 as uuidv4 } from "uuid";
import Answer from "../models/answer.js";
import Question from "../models/question.js";

export const getAnswersForQuestion = async (req, res) => {
  try {
    const { id: questionId } = req.params;

    const answers = await Answer.find({ questionId }).sort({ createdAt: 1 });
    return res.json({ answers });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch answers", error: err.message });
  }
};

export const createAnswerForQuestion = async (req, res) => {
  try {
    const { id: questionId } = req.params;
    const { body, userId } = req.body || {};

    if (!userId) return res.status(401).json({ message: "Bad auth" });
    if (!body) return res.status(400).json({ message: "body required" });

    const questionExists = await Question.findOne({ id: questionId });
    if (!questionExists)
      return res.status(404).json({ message: "Question not found" });

    const answer = await Answer.create({
      id: uuidv4(),
      questionId,
      userId,
      body: String(body).trim(),
    });

    return res.status(201).json({
      message: "Answer created successfully",
      answer,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to create answer", error: err.message });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};

    if (!userId) return res.status(401).json({ message: "Bad auth" });

    const answer = await Answer.findOne({ id });
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    if (answer.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can delete only your own answer" });
    }

    await Answer.deleteOne({ id });
    return res.json({ message: "Answer deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to delete answer", error: err.message });
  }
};
