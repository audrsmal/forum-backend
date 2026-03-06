import { v4 as uuidv4 } from "uuid";
import Question from "../models/question.js";
import Answer from "../models/answer.js";

const allowedTopics = [
  "politics",
  "sports",
  "gaming",
  "cooking",
  "everything-else",
];

export const getQuestions = async (req, res) => {
  try {
    const { topic, answered } = req.query;

    const query = {};

    if (topic) {
      query.topic = topic;
    }

    const questions = await Question.find(query).sort({ createdAt: -1 });

    const questionsWithAnswerCount = await Promise.all(
      questions.map(async (question) => {
        const answersCount = await Answer.countDocuments({
          questionId: question.id,
        });

        return {
          ...question.toObject(),
          answersCount,
        };
      }),
    );

    let filteredQuestions = questionsWithAnswerCount;

    if (answered === "answered") {
      filteredQuestions = questionsWithAnswerCount.filter(
        (question) => question.answersCount > 0,
      );
    }

    if (answered === "unanswered") {
      filteredQuestions = questionsWithAnswerCount.filter(
        (question) => question.answersCount === 0,
      );
    }

    return res.json({ questions: filteredQuestions });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch questions", error: err.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findOne({ id });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answersCount = await Answer.countDocuments({
      questionId: question.id,
    });

    return res.json({
      question: {
        ...question.toObject(),
        answersCount,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch question", error: err.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, body, topic, userId } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: "Bad auth" });
    }

    if (!title || !body || !topic) {
      return res
        .status(400)
        .json({ message: "title, body and topic are required" });
    }

    if (!allowedTopics.includes(topic)) {
      return res.status(400).json({ message: "Invalid topic" });
    }

    const question = await Question.create({
      id: uuidv4(),
      userId,
      title: String(title).trim(),
      body: String(body).trim(),
      topic,
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

    if (!userId) {
      return res.status(401).json({ message: "Bad auth" });
    }

    const question = await Question.findOne({ id });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can delete only your own question" });
    }

    await Question.deleteOne({ id });
    await Answer.deleteMany({ questionId: id });

    return res.json({ message: "Question deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to delete question", error: err.message });
  }
};
