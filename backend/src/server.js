import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimiter from "./middleware/rateLimiter.js";
import { connectDB } from "./config/db.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Middleware
if (process.env.NODE_ENV !== "production") {
    app.use(cors({
        origin: "http://localhost:8080",
        credentials: true
    }));
}

app.use(express.json());
app.use(rateLimiter);

// Routes
// import notesRoutes from "./routes/notesRoutes.js";
// app.use("/api/notes", notesRoutes);
// Placeholder route to verify backend is working
app.get("/api/health", (req, res) => {
    res.json({ message: "Backend is running" });
});


if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}

connectDB();
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
