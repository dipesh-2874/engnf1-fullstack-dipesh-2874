import dotenv from "dotenv";
import { createApp } from "./app.js";
import connectDB from "./config/db.js";

dotenv.config({ path: new URL("../../.env", import.meta.url), quiet: true });

const app = createApp({ serveFrontend: process.env.SERVE_FRONTEND === "true" });
const port = Number(process.env.PORT || process.env.BACKEND_PORT || 5000);

await connectDB();
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
