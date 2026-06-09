import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }),
);


// Test route
app.get("/", (req, res) => {
  res.send("Buildlog API running...");
});
// Health check (no rate limit)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});
app.get("/", (req, res) => {
  res.status(200).send("Buildlog API");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
