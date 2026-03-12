import Question from "../models/question.js";
import Answer from "../models/answer.js";

const topics = ["politics", "sports", "gaming", "cooking", "everything-else"];

export const getTopicStats = async (req, res) => {
  try {
    const stats = await Promise.all(
      topics.map(async (topic) => {
        const questions = await Question.find({ topic }).select("id");
        const questionIds = questions.map((question) => question.id);

        const questionsCount = questions.length;
        const answersCount = await Answer.countDocuments({
          questionId: { $in: questionIds },
        });

        return {
          topic,
          questionsCount,
          answersCount,
        };
      }),
    );

    return res.json({ topics: stats });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch topic stats",
      error: err.message,
    });
  }
};
