import { Router } from "express";
import authUser from "../middleware/auth.js";
import {
  getQuestions,
  createQuestion,
  deleteQuestion,
} from "../controllers/question.js";
import {
  getAnswersForQuestion,
  createAnswerForQuestion,
} from "../controllers/answer.js";

const router = Router();

router.get("/questions", getQuestions);
router.post("/question", authUser, createQuestion);
router.delete("/question/:id", authUser, deleteQuestion);

router.get("/question/:id/answers", getAnswersForQuestion);
router.post("/question/:id/answers", authUser, createAnswerForQuestion);

export default router;
