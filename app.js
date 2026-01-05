import dotenv from 'dotenv';
import express from "express";

import { logMessage } from "./utilities/logKeeper.js";


// application configuration
dotenv.config();
const app = express();
export default app;

// TODO: database connection


// request configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.use((req, res, next) => {
  logMessage(`${req.method} ${req.url}`);
  next();
});


app.use(express.json());
app.use("/api/", () => {}); // TODO: placeholder for routes


// health checking
app.get('/health', (req, res) => {
  res.json({
    application: 'running',
    database: 'connected', // TODO: placeholder
    timestamp: new Date().toISOString()
  });
});


// error handling
app.use((err, req, res, next) => {
  logMessage(`Error occurred: ${err.message}`);
  return res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.ENV_TYPE != 'production' && { stack: err.stack })
  });
});

app.use((req, res) => {
  logMessage(`Unknown Route: ${req.method} ${req.url}`);
  return res.status(404).json({ message: 'Route not found' });
});
