import { ErrorRequestHandler } from "express";
import logEvents from "../utils/logEvents";
import { Request, Response, NextFunction } from "express";

interface ErrorHandler extends Error {
  status?: number;
}

const errorHandler: ErrorRequestHandler = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logEvents(`${err.name}: ${err.message}`, "errLog.txt");
  console.log(err.stack);
  res.status(err.status || 500).send(err.message);
};

export default errorHandler;
