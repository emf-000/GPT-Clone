import express from "express";
import Thread from "../models/Thread.js";
import getTogetherLlama3Response from "../utils/T_AI.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.post("/test", authMiddleware, async (req, res) => {
  try {
    const thread = new Thread({
      threadId: "abe",
      title: "Testing New Thread",
      user: req.user._id,
    });
    const response = await thread.save();
    res.send(response);
  } catch (err) {
    return res.status(500).json({ error: "Failed to save in DB" });
  }
});

router.get("/thread", authMiddleware, async (req, res) => {
  try {
    const threads = await Thread.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json(threads);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOne({
      threadId,
      user: req.user._id,
    });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    return res.json(thread.messages);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;
  try {
    const deletedThread = await Thread.findOneAndDelete({
      threadId,
      user: req.user._id,
    });
    if (!deletedThread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    return res.status(200).json({ success: "Thread deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete thread" });
  }
});

router.post("/chat", authMiddleware, async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId, user: req.user._id });
    if (!thread) {
      thread = new Thread({
        threadId,
        title: message,
        messages: [{ role: "user", content: message }],
        user: req.user._id,
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getTogetherLlama3Response(message);
    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();
    return res.json({ reply: assistantReply });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
