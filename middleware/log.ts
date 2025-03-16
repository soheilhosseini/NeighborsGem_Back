import logEvents from "../utils/logEvents";
import { Request, Response, NextFunction } from "express";

const log = (req: Request, res: Response, next: NextFunction) => {
  logEvents(`${req.method}\t ${req.headers.origin}\t ${req.url}`, "reqLog.txt");
  console.log(`${req.method} ${req.path}`);
  next();
};

export default log;
