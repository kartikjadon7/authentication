import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRouter from "./src/routes/auth.routes.js";
dotenv.config();

const app = express();

app.use(express.json())

app.use('/auth', authRouter);

connectDB();

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})