import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import characterRoutes from "./routes/characters.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// Routes
app.use("/auth", authRoutes);
app.use("/characters", characterRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "D&D Character Sheet API is running!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
