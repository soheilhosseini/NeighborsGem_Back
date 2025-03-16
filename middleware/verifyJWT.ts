import { Request, Response, NextFunction } from "express";

import jwt, { Secret } from "jsonwebtoken";
require("dotenv").config();

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);
  console.log(authHeader);
  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as Secret,
    (err, decoded) => {
      if (err) return res.sendStatus(403); // invalid token
      if (decoded) req.user = decoded.username;
      next();
    }
  );
};

export default verifyJWT;
