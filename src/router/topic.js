import { Router } from "express";
import { getTopicStats } from "../controllers/topic.js";

const router = Router();

router.get("/topics/stats", getTopicStats);

export default router;
