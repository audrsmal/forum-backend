import { v4 as uuidv4 } from "uuid";
import Question from "../models/question.js";
import Answer from "../models/answer.js";
import User from "../models/user.js";
import Vote from "../models/vote.js";

const allowedTopics = [
  "politics",
  "sports",
  "gaming",
  "cooking",
  "everything-else",
];

const getVoteData = async (targetType, targetId, userId = null) => {
  const votes = await Vote.find({ targetType, targetId });

  const likes = votes.filter((vote) => vote.value === 1).length;
  const dislikes = votes.filter((vote) => vote.value === -1).length;

  let userVote = 0;

  if (userId) {
    const existingVote = votes.find((vote) => vote.userId === userId);
    userVote = existingVote ? existingVote.value : 0;
  }

  return { likes, dislikes, userVote };
};

const mapQuestionWithAuthor = async (question, currentUserId = null) => {
  const author = await User.findOne({ id: question.userId }).select(
    "id name email",
  );
  const answersCount = await Answer.countDocuments({ questionId: question.id });
  const voteData = await getVoteData("question", question.id, currentUserId);

  return {
    ...question.toObject(),
    author: author
      ? {
          id: author.id,
          name: author.name,
          email: author.email,
        }
      : null,
    answersCount,
    likes: voteData.likes,
    dislikes: voteData.dislikes,
    userVote: voteData.userVote,
  };
};

export const getQuestions = async (req, res) => {
  try {
    const { topic, answered, userId } = req.query;

    const query = {};

    if (topic) {
      query.topic = topic;
    }

    const questions = await Question.find(query).sort({ createdAt: -1 });

    const questionsWithAuthor = await Promise.all(
      questions.map((question) =>
        mapQuestionWithAuthor(question, userId || null),
      ),
    );

    let filteredQuestions = questionsWithAuthor;

    if (answered === "answered") {
      filteredQuestions = questionsWithAuthor.filter(
        (question) => question.answersCount > 0,
      );
    }

    if (answered === "unanswered") {
      filteredQuestions = questionsWithAuthor.filter(
        (question) => question.answersCount === 0,
      );
    }

    return res.json({ questions: filteredQuestions });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch questions",
      error: err.message,
    });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const question = await Question.findOne({ id });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const mappedQuestion = await mapQuestionWithAuthor(
      question,
      userId || null,
    );

    return res.json({ question: mappedQuestion });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch question",
      error: err.message,
    });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, body, topic, userId } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: "Bad auth" });
    }

    if (!title || !body || !topic) {
      return res.status(400).json({
        message: "title, body and topic are required",
      });
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

    const mappedQuestion = await mapQuestionWithAuthor(question, userId);

    return res.status(201).json({
      message: "Question created successfully",
      question: mappedQuestion,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create question",
      error: err.message,
    });
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
      return res.status(403).json({
        message: "You can delete only your own question",
      });
    }

    await Question.deleteOne({ id });
    await Answer.deleteMany({ questionId: id });
    await Vote.deleteMany({ targetType: "question", targetId: id });

    return res.json({ message: "Question deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete question",
      error: err.message,
    });
  }
};
