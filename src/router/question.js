import { Router } from "express";
import authUser from "../middleware/auth.js";
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  deleteQuestion,
} from "../controllers/question.js";
import {
  getAnswersForQuestion,
  createAnswerForQuestion,
} from "../controllers/answer.js";
import { voteQuestionLike, voteQuestionDislike } from "../controllers/vote.js";

const router = Router();

router.get("/questions", getQuestions);
router.get("/question/:id", getQuestionById);

router.post("/question", authUser, createQuestion);
router.delete("/question/:id", authUser, deleteQuestion);

router.post("/question/:id/like", authUser, voteQuestionLike);
router.post("/question/:id/dislike", authUser, voteQuestionDislike);

router.get("/question/:id/answers", getAnswersForQuestion);
router.post("/question/:id/answers", authUser, createAnswerForQuestion);

export default router;
