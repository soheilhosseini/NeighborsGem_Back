import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sameSite } from "./generals";
import { Response } from "express";
import Mailjet from "node-mailjet";
import nodemailer from "nodemailer";
dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC!,
  process.env.MJ_APIKEY_PRIVATE!
);

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

export const handleEmail = ({
  destinationEmail,
  code,
}: {
  destinationEmail: string;
  code: string;
}) => {
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "info@nesgem.com",
          Name: "Nesgem",
        },
        To: [
          {
            Email: destinationEmail,
            Name: "passenger 1",
          },
        ],
        Subject: "Nesgem: Forget Password Confirmation",
        // TextPart: "This is Your Code: " + code,
        HTMLPart: `<h3>This is your code : ${code}</h3>`,
      },
    ],
  });

  return request.then((result) => {
    return result.body;
  });
};
