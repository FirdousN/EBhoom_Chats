import express from "express";
import dotenv from "dotenv"

import { connectDB } from "./lib/db.js"
import cookiesParser from 'cookie-parser'

import authRoutes from "./routes/auth.route.js"
import messageRoutes from './routes/auth.route.js'
import cors from 'cors'

dotenv.config()
const app = express();

const PORT = process.env.PORT
// middleware
app.use(express.json());
app.use(cookiesParser());
app.use(cors({
    origin:"http://localhost:5174",
    credentials: true
}))
app.use("/api/auth", authRoutes);
app.use("api/message", messageRoutes);

app.listen(PORT, ()=>{
    console.log("server is running on PORT:" + PORT);
    connectDB()
});
