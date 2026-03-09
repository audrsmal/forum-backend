import { Router } from "express";
import authUser from "../middleware/auth.js";
import { deleteAnswer } from "../controllers/answer.js";
import { voteAnswerLike, voteAnswerDislike } from "../controllers/vote.js";

const router = Router();

router.delete("/answer/:id", authUser, deleteAnswer);
router.post("/answer/:id/like", authUser, voteAnswerLike);
router.post("/answer/:id/dislike", authUser, voteAnswerDislike);

export default router;
