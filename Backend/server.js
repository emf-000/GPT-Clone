import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(
  cors({
    origin: process.env.Frontend_URL,
    credentials: true,
  })
);

app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to Database");
  } catch (err) {
    console.log("Failed to connect with DB", err);
  }
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
