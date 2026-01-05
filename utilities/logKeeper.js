import fs from "node:fs/promises";
import { join } from "node:path";

export async function logMessage(message, echo = true) {
  try {
    const timestamp = new Date().toISOString().replace("T", " ").replace(/\..+/, "");
    const today = timestamp.slice(0, 10);

    const logDirectory = join(process.cwd(), "logs");
    await fs.mkdir(logDirectory, { recursive: true });

    const logFile = join(logDirectory, `${today}.log`);
    const logEntry = `[${timestamp}] ${
      typeof message == "object" ? JSON.stringify(message, null, 2) : message
    }\n`;

    await fs.appendFile(logFile, logEntry);
    if (echo) console.log(logEntry.trim());
  }
  catch (error) {
    console.error(`Logging failed : ${error.message}`);
  }
}