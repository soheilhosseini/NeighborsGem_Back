import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
require("dotenv").config();

const publicAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const access_token = req.cookies.access_token;

  if (process.env.ACCESS_TOKEN_SECRET && access_token) {
    jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN_SECRET,
      (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          next();
          return;
        }

        // @ts-ignore
        req.body = { ...req.body, main_id: decoded._id };
        next();
      }
    );
  } else {
    next();
  }
};

export default publicAuthentication;
