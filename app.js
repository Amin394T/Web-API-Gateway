import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import router from "./source/router.js";
import { logMessage } from "./utilities/logKeeper.js";


// TODO: database connection


// app configuration
dotenv.config();

const app = express();
export default app;

app.use(express.json());
app.use("/favicon.ico", (req, res) => res.status(204));

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// traffic logging
app.use((req, res, next) => {
  res.on("finish", () => {
    logMessage(`${req.method} ${req.url} ${res.statusCode}`);
  });
  next();
});


// routes handling
app.use("/", router);


// error handling
app.use((req, res) => {
  return res.status(404).json({ status: 404, message: "Route Not Found" });
});

app.use((err, req, res, next) => {
  logMessage(`Error occurred: ${err.message}`);

  return res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
    ...(process.env.ENV_TYPE != "production" && { details: err.stack }),
  });
});
