import logEvents from "../utils/logEvents";
import { Request, Response, NextFunction } from "express";

const log = (req: Request, res: Response, next: NextFunction) => {
  // const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  // const userAgent = req.headers["user-agent"] || "unknown";
  // const origin = req.headers.origin || "unknown";

  // const logMessage = `[${new Date().toISOString()}] ${req.method} ${
  //   req.originalUrl
  // } | IP: ${ip} | Origin: ${origin} | UA: ${userAgent}`;

  // logEvents(logMessage, "reqLog.txt");

  // if (process.env.NODE_ENV !== "production") {
  //   console.log(logMessage);
  // }

  console.log(req.url , req.method);

  next();
};

export default log;
