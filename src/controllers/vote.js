import { v4 as uuidv4 } from "uuid";
import Vote from "../models/vote.js";
import Question from "../models/question.js";
import Answer from "../models/answer.js";

const getTargetModel = (targetType) => {
  if (targetType === "question") return Question;
  if (targetType === "answer") return Answer;
  return null;
};

const getVoteCounts = async (targetType, targetId) => {
  const votes = await Vote.find({ targetType, targetId });

  const likes = votes.filter((vote) => vote.value === 1).length;
  const dislikes = votes.filter((vote) => vote.value === -1).length;

  return { likes, dislikes };
};

const handleVote = async (req, res, targetType, voteValue) => {
  try {
    const { id: targetId } = req.params;
    const { userId } = req.body || {};

    if (!userId) {
      return res.status(401).json({ message: "Bad auth" });
    }

    const TargetModel = getTargetModel(targetType);

    if (!TargetModel) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    const targetExists = await TargetModel.findOne({ id: targetId });
    if (!targetExists) {
      return res.status(404).json({
        message: `${targetType === "question" ? "Question" : "Answer"} not found`,
      });
    }

    const existingVote = await Vote.findOne({
      userId,
      targetType,
      targetId,
    });

    if (!existingVote) {
      await Vote.create({
        id: uuidv4(),
        userId,
        targetType,
        targetId,
        value: voteValue,
      });
    } else if (existingVote.value === voteValue) {
      // clicking same vote again removes it
      await Vote.deleteOne({ id: existingVote.id });
    } else {
      // switch like <-> dislike
      existingVote.value = voteValue;
      await existingVote.save();
    }

    const { likes, dislikes } = await getVoteCounts(targetType, targetId);

    const currentVote = await Vote.findOne({
      userId,
      targetType,
      targetId,
    });

    return res.json({
      message: "Vote updated successfully",
      likes,
      dislikes,
      userVote: currentVote ? currentVote.value : 0,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate vote detected" });
    }

    return res.status(500).json({
      message: "Failed to update vote",
      error: err.message,
    });
  }
};

export const voteQuestionLike = async (req, res) => {
  return handleVote(req, res, "question", 1);
};

export const voteQuestionDislike = async (req, res) => {
  return handleVote(req, res, "question", -1);
};

export const voteAnswerLike = async (req, res) => {
  return handleVote(req, res, "answer", 1);
};

export const voteAnswerDislike = async (req, res) => {
  return handleVote(req, res, "answer", -1);
};
