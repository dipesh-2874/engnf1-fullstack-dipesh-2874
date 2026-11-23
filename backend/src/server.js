import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config({ 
    path: new URL("../../.env", import.meta.url),
 });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "TriageSync is running...",
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async() => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer(); 