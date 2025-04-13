import { Request, Response } from "express";
import messagesConstant from "../../constants/messages";
import bcrypt from "bcrypt";
import path from "path";
import UserModel from "../../model/user";
import TempUserModel from "../../model/tempUser";
import {
  emailValidator,
  isValidPassword,
  phoneNumberValidator,
} from "../../utils/validation";
import dotenv from "dotenv";
import { generateAccessToken } from "../../utils/auth";
import jwt from "jsonwebtoken";

dotenv.config();

const loginWithPasswordController = async (req: Request, res: Response) => {
  const { user_identity, password } = req.body;
  if (!user_identity) {
    res
      .status(400)
      .json({ message: messagesConstant.en.loginUserIdentityIsEmpty });
    return;
  }

  const foundedUser = await UserModel.findOne({
    $or: [
      { phone_number: user_identity },
      { email: user_identity },
      { username: user_identity },
    ],
  });

  if (!foundedUser) {
    res.status(409).json({ message: messagesConstant.en.loginUserNotFound });
    return;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    foundedUser.password as string
  );
  if (isPasswordValid) {
    const access_token = generateAccessToken(foundedUser._id.toString());
    if (access_token) {
      res.cookie("access_token", access_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: "strict",
      });
      res.sendStatus(200);
    }
  } else {
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

  const foundedUser = await UserModel.findOne({
    $or: [
      { phone_number: user_identity },
      { email: user_identity },
      { username: user_identity },
    ],
  });

  if (!foundedUser) {
    res.status(404).json({ message: messagesConstant.en.loginUserNotFound });
    return;
  }

  res.json({ message: messagesConstant.en.optSent });
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
      { phone_number: user_identity },
      { email: user_identity },
      { username: user_identity },
    ],
  });

  if (!foundedUser) {
    res.status(404).json({ message: messagesConstant.en.expiredOtp });
    return;
  }

  if (otp === "123") {
    const access_token = generateAccessToken(foundedUser._id.toString());
    if (access_token) {
      res.cookie("access_token", access_token, {
        path: "/",
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: "strict",
      });
      res.sendStatus(200);
    }
  } else {
    res.status(400).json({ message: messagesConstant.en.wrongOtp });
    return;
  }
};

const logoutController = (req: Request, res: Response) => {
  res.clearCookie("access_token", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.status(204).json({ message: messagesConstant.en.logout });
};

export {
  loginWithPasswordController,
  loginWithOTPGetUserIdentityController,
  loginWithOTPCheckOTPController,
  logoutController,
};
