import { Request, Response, NextFunction } from "express";
import messagesConstant from "../constants/messages";
import jwt from "jsonwebtoken";
require("dotenv").config();

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const access_token = req.cookies.access_token;

  if (!access_token)
    return res.status(401).json({ message: messagesConstant.en.invalidToken });

  if (process.env.ACCESS_TOKEN_SECRET) {
    jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN_SECRET,
      (err: jwt.VerifyErrors | null, user: any) => {
        if (err)
          return res
            .status(401)
            .json({ message: messagesConstant.en.invalidToken });
        // @ts-ignore
        req.user = user;
        next();
      }
    );
  }

  // const authHeader = req.headers["authorization"];
  // if (!authHeader) return res.sendStatus(401);
  // console.log(authHeader);
  // const token = authHeader.split(" ")[1];
  // jwt.verify(
  //   token,
  //   process.env.ACCESS_TOKEN_SECRET as Secret,
  //   (err, decoded) => {
  //     if (err) return res.sendStatus(403); // invalid token
  //     if (decoded) req.user = decoded.username;
  //     next();
  //   }
  // );
};

export default verifyJWT;
