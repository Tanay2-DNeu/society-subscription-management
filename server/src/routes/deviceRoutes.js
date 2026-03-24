import express from "express";
import pool from "../db/pool.js";
const router = express.Router();

router.post("/save-token", async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;
  try {
    await pool.query(
      "INSERT INTO device_tokens (user_id, token) VALUES ($1, $2)",
      [userId, token],
    );
    res.status(200).json({ message: "Token saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
