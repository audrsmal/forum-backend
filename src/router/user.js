import { Router } from "express";
import { login, register, me } from "../controllers/user.js";
import authUser from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authUser, me);

export default router;
