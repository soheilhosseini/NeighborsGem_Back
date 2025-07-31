import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Request, Response } from "express";
import fs from "fs/promises";
import { OAuth2Client } from "google-auth-library";
import path from "path";
import messagesConstant from "../../constants/messages";
import FileModel from "../../model/file";
import UserModel from "../../model/user";
import {
  addAccessTokenToCookie,
  generateAccessToken,
  handleEmail,
} from "../../utils/auth";
import { sameSite } from "../../utils/generals";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginWithPasswordController = async (req: Request, res: Response) => {
  const { user_identity, password } = req.body;
  if (!user_identity) {
    res
      .status(400)
      .json({ message: messagesConstant.en.loginUserIdentityIsEmpty });
    return;
  }

  try {
    const foundedUser = await UserModel.findOne({
      $or: [
        // { phone_number: user_identity },
        { email: { $regex: `^${user_identity}$`, $options: "i" } },
        { username: { $regex: `^${user_identity}$`, $options: "i" } },
      ],
    });

    if (!foundedUser) {
      res
        .status(409)
        .json({ message: messagesConstant.en.userOrPasswordIsWrong });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      foundedUser.password as string
    );
    if (isPasswordValid) {
      addAccessTokenToCookie(
        res,
        generateAccessToken(foundedUser._id.toString())
      );
      res.sendStatus(200);
    } else {
      throw Error();
    }
  } catch {
    res
      .status(400)
      .json({ message: messagesConstant.en.loginWithPasswordWrongInputs });
  }
};

const loginWithOTPGetUserIdentityController = async (
  req: Request,
  res: Response
) => {
  const { user_identity } = req.body;
  if (!user_identity) {
    res.sendStatus(400);
    return;
  }

  try {
    const foundedUser = await UserModel.findOne({
      $or: [
        // { phone_number: user_identity },
        { email: { $regex: `^${user_identity}$`, $options: "i" } },
        { username: { $regex: `^${user_identity}$`, $options: "i" } },
      ],
    });

    if (!foundedUser) {
      res.status(404).json({ message: messagesConstant.en.loginUserNotFound });
      return;
    }

    // if (process.env.NODE_ENV === "production") {
    // if (foundedUser.email) {
    // const code = Math.random().toString().slice(0, 4);
    // await handleEmail({ destinationEmail: foundedUser.email, code })
    //   .then(() => res.json({ message: messagesConstant.en.optSent }))
    //   .catch((err) => console.log("err", err));
    // return;
    // }
    // } else {
    //   res.json({ message: messagesConstant.en.optSent });
    // }
    res.json({ message: messagesConstant.en.optSent });
  } catch {
    res.sendStatus(500);
  }
};

const loginWithOTPCheckOTPController = async (req: Request, res: Response) => {
  const { otp, user_identity } = req.body;
  if (!otp || !user_identity) {
    res.status(400).json({
      message: messagesConstant.en.emptyOtp,
    });
    return;
  }

  const foundedUser = await UserModel.findOne({
    $or: [
      // { phone_number: user_identity },
      { email: { $regex: `^${user_identity}$`, $options: "i" } },
      { username: { $regex: `^${user_identity}$`, $options: "i" } },
    ],
  });

  if (!foundedUser) {
    res.status(404).json({ message: messagesConstant.en.wrongOtp });
    return;
  }

  if (otp === "123") {
    try {
      addAccessTokenToCookie(
        res,
        generateAccessToken(foundedUser._id.toString())
      );
      res.sendStatus(200);
    } catch {
      res.sendStatus(400);
    }
  } else {
    res.status(400).json({ message: messagesConstant.en.wrongOtp });
    return;
  }
};

const loginWithGoogleController = async (req: Request, res: Response) => {
  const { credential } = req.body;

  if (!credential) {
    res.sendStatus(400);
    return;
  }
  let googleUserInfo;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    googleUserInfo = ticket?.getPayload();
    if (!googleUserInfo) {
      res.sendStatus(400);
      return;
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
    return;
  }

  const userInfo = googleUserInfo;

  if (!userInfo || !userInfo.email_verified) {
    res.status(400).json({ message: messagesConstant.en.invalidEmail });
    return;
  }

  const foundedUser = await UserModel.findOne({ email: userInfo.email });

  if (foundedUser) {
    try {
      addAccessTokenToCookie(
        res,
        generateAccessToken(foundedUser._id.toString())
      );
      res.sendStatus(200);
    } catch {
      res.sendStatus(400);
    }
  } else {
    try {
      const payload = {
        email: userInfo.email,
        first_name: userInfo.given_name,
        last_name: userInfo.family_name,
      };
      const newUser = await UserModel.insertOne(payload);
      console.log(userInfo);
      if (userInfo.picture) {
        const response = await fetch(userInfo.picture);

        if (!response.ok || !response.body) {
          throw new Error();
        }

        // 1. Generate filename
        const filename = `${Date.now()}${userInfo.name || Math.random()}.jpg`;

        // 2. Read the response body into a buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Save original file
        const savePath = path.join("uploads/avatars", filename);
        await fs.writeFile(savePath, buffer);

        // 4. Save thumbnail file
        const thumbnailSavePath = path.join(
          "uploads/avatars/thumbnails",
          filename
        );
        await fs.writeFile(thumbnailSavePath, buffer);

        // Example: Save to your File model
        const fileDoc = await FileModel.create({
          file_path: "/" + savePath,
          thumbnail_path: "/" + thumbnailSavePath,
          mime_type: "image/jpeg",
          createdBy: newUser._id,
        });

        await UserModel.findByIdAndUpdate(newUser._id, { avatar: fileDoc._id });
      }

      addAccessTokenToCookie(res, generateAccessToken(newUser._id.toString()));
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(500);
      console.log(err);
    }
  }
};

const recaptchaController = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    res.sendStatus(400);
    return;
  }
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const googleRes = await fetch(verificationUrl, { method: "POST" });
    const result = await googleRes.json();
    if (result.success) {
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Verification error" });
  }
};

const logoutController = (req: Request, res: Response) => {
  res.clearCookie("access_token", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: sameSite(),
  });
  res.status(204).json({ message: messagesConstant.en.logout });
};

export {
  loginWithGoogleController,
  loginWithOTPCheckOTPController,
  loginWithOTPGetUserIdentityController,
  loginWithPasswordController,
  logoutController,
  recaptchaController,
};
