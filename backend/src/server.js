import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config({ 
    path: new URL("../../.env", import.meta.url),
 });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
console.log("Auth routes mounted successfully!");

app.use("/api/test", testRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);

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