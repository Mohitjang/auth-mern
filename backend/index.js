// const express = require("expresss");
import express from "express";
import dotenv from "dotenv";
// import { connectDB } from "../db/connectDB.js";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world !");
});

// redirecting to auth routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("the server is running on port  !!! "+ PORT);
});
