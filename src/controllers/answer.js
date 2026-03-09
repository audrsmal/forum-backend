import { v4 as uuidv4 } from "uuid";
import Answer from "../models/answer.js";
import Question from "../models/question.js";
import User from "../models/user.js";
import Vote from "../models/vote.js";

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

const mapAnswerWithAuthor = async (answer, currentUserId = null) => {
  const author = await User.findOne({ id: answer.userId }).select(
    "id name email",
  );
  const voteData = await getVoteData("answer", answer.id, currentUserId);

  return {
    ...answer.toObject(),
    author: author
      ? {
          id: author.id,
          name: author.name,
          email: author.email,
        }
      : null,
    likes: voteData.likes,
    dislikes: voteData.dislikes,
    userVote: voteData.userVote,
  };
};

export const getAnswersForQuestion = async (req, res) => {
  try {
    const { id: questionId } = req.params;
    const { userId } = req.query;

    const answers = await Answer.find({ questionId }).sort({ createdAt: 1 });

    const answersWithAuthor = await Promise.all(
      answers.map((answer) => mapAnswerWithAuthor(answer, userId || null)),
    );

    return res.json({ answers: answersWithAuthor });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch answers",
      error: err.message,
    });
  }
};

export const createAnswerForQuestion = async (req, res) => {
  try {
    const { id: questionId } = req.params;
    const { body, userId } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: "Bad auth" });
    }

    if (!body) {
      return res.status(400).json({ message: "body required" });
    }

    const questionExists = await Question.findOne({ id: questionId });
    if (!questionExists) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = await Answer.create({
      id: uuidv4(),
      questionId,
      userId,
      body: String(body).trim(),
    });

    const mappedAnswer = await mapAnswerWithAuthor(answer, userId);

    return res.status(201).json({
      message: "Answer created successfully",
      answer: mappedAnswer,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create answer",
      error: err.message,
    });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: "Bad auth" });
    }

    const answer = await Answer.findOne({ id });
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.userId !== userId) {
      return res.status(403).json({
        message: "You can delete only your own answer",
      });
    }

    await Answer.deleteOne({ id });
    await Vote.deleteMany({ targetType: "answer", targetId: id });

    return res.json({ message: "Answer deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete answer",
      error: err.message,
    });
  }
};
