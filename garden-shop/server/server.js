import express from "express";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// --- MongoDB connection (Mongoose 7+) ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("MongoDB connection error:", err));

// --- Test route ---
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// --- Start server ---
const { DEFAULT_PORT } = require('./config/constants');
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
