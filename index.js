import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRouter from "./src/router/user.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    if (!process.env.MONGO_DB_CONNECTION) {
      throw new Error("Missing MONGO_DB_CONNECTION in .env");
    }

    await mongoose.connect(process.env.MONGO_DB_CONNECTION);
    console.log("MongoDB connected");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
