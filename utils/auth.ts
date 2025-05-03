import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sameSite } from "./generals";
import { Response } from "express";

dotenv.config();

export function generateAccessToken(_id: string) {
  if (process.env.ACCESS_TOKEN_SECRET)
    return jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1000000s",
    });
}

export function addAccessTokenToCookie(res: Response, access_token?: string) {
  if (access_token)
    return res.cookie("access_token", access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: sameSite(),
    });
  else throw new Error();
}
