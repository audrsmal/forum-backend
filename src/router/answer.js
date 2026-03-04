import { Router } from "express";
import authUser from "../middleware/auth.js";
import { deleteAnswer } from "../controllers/answer.js";

const router = Router();

router.delete("/answer/:id", authUser, deleteAnswer);

export default router;
