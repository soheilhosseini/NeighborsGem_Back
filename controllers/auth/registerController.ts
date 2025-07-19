import { Request, Response } from "express";
import messagesConstant from "../../constants/messages";
import UserModel from "../../model/user";
import TempUserModel from "../../model/tempUser";
import {
  emailValidator,
  isValidPassword,
  phoneNumberValidator,
} from "../../utils/validation";
import dotenv from "dotenv";
import { generateAccessToken } from "../../utils/auth";
import { sameSite } from "../../utils/generals";

dotenv.config();

const handlePreRegister = async (req: Request, res: Response) => {
  const { user_identity } = req.body;
  if (!user_identity) {
    res
      .status(400)
      .json({ message: messagesConstant.en.preRegisterEmptyField });
    return;
  }

  const foundedUser = await UserModel.findOne({
    $or: [
      // { phone_number: user_identity },
      { email: user_identity },
      { username: user_identity },
    ],
  });

  if (foundedUser) {
    res
      .status(409)
      .json({ message: messagesConstant.en.preRegisterExistingAccount });
    return;
  }

  const foundedTempUser = await TempUserModel.findOne({
    $or: [
      // { phone_number: user_identity },
      { email: user_identity },
    ],
  });

  if (foundedTempUser) {
  }

  if (!foundedTempUser) {
    // const isPhoneNumberProvided = !isNaN(user_identity);
    let payload;
    // if (!isPhoneNumberProvided) {
    if (emailValidator(user_identity)) {
      payload = { email: user_identity };
    } else {
      res.status(400).json({ message: messagesConstant.en.emailIsInvalid });
      return;
    }
    // } else {
    //   if (phoneNumberValidator(user_identity)) {
    //     payload = { phone_number: user_identity };
    //   } else {
    //     res.status(400).json({ message: messagesConstant.en.phoneIsInvalid });
    //     return;
    //   }
    // }
    const tempUser = new TempUserModel({ ...payload, otp: 123 });
    await tempUser.save();
  } else {
    try {
      await TempUserModel.updateOne(
        { _id: foundedTempUser._id },
        { $set: { createAt: Date.now(), otp: 123 } }
      );
    } catch (err) {
      console.log(err);
    }
  }
  res.status(201).json({ message: messagesConstant.en.optSent });
};

const handleOtp = async (req: Request, res: Response) => {
  const { otp, user_identity } = req.body;
  if (!otp || !user_identity) {
    res.status(400).json({
      message: messagesConstant.en.emptyOtp,
    });
    return;
  }

  const foundedTempUser = await TempUserModel.findOne({
    $or: [
      // { phone_number: user_identity },
      { email: user_identity },
    ],
  });

  if (!foundedTempUser) {
    res.status(404).json({ message: messagesConstant.en.expiredOtp });
    return;
  }

  if (otp === foundedTempUser.otp) {
    try {
      await TempUserModel.updateOne(
        { _id: foundedTempUser._id },
        { $set: { successfulOpt: true } }
      );
      res.status(200).json({ message: messagesConstant.en.correctOtp });
      return;
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.status(400).json({ message: messagesConstant.en.wrongOtp });
    return;
  }
};

const handleSetUserName = async (req: Request, res: Response) => {
  const { username, user_identity } = req.body;
  if (!username || !user_identity) {
    res.status(400).json({
      message: messagesConstant.en.emptyUsername,
    });
    return;
  }

  const foundedTempUser = await TempUserModel.findOne({
    $or: [
      // { phone_number: user_identity },
      { email: user_identity },
    ],
  });
  if (foundedTempUser) {
    if (!foundedTempUser.successfulOpt) {
      res.status(400).json({ message: messagesConstant.en.expiredOtp });
      return;
    }
    const isDuplicated = await UserModel.findOne({
      username: { $regex: `^${username}$`, $options: "i" },
    });
    if (isDuplicated) {
      res.status(409).json({ message: messagesConstant.en.existUsername });
      return;
    }
    try {
      await TempUserModel.updateOne(
        {
          $or: [
            // { phone_number: user_identity },
            { email: user_identity },
          ],
        },
        { $set: { username } }
      );
      res.sendStatus(200);
      return;
    } catch (err) {
      res.sendStatus(500);
      console.log(err);
    }
  } else {
    res.status(404).json({ message: messagesConstant.en.expiredOtp });
    return;
  }
};

const handleSetPassword = async (req: Request, res: Response) => {
  const { user_identity, password } = req.body;
  if (!user_identity || !password) {
    res.status(404).json({ message: messagesConstant.en.emptyPassword });
  }

  if (!isValidPassword(password)) {
    res.status(400).json({ message: messagesConstant.en.invalidPassword });
  }

  const foundedTempUser = await TempUserModel.findOne({
    $or: [
      // { phone_number: user_identity },
      { email: user_identity },
    ],
  });
  if (foundedTempUser) {
    const payload = {
      username: foundedTempUser.username,
      email: foundedTempUser.email,
      // phone_number: foundedTempUser.phone_number,
      password,
    };

    const newUser = await UserModel.insertOne(payload);
    await TempUserModel.deleteOne({ _id: foundedTempUser._id });
    if (process.env.ACCESS_TOKEN_SECRET) {
      const access_token = generateAccessToken(newUser._id.toString());
      if (access_token) {
        res.cookie("access_token", access_token, {
          path: "/",
          httpOnly: true,
          secure: true,
          maxAge: 24 * 60 * 60 * 1000, // 1 day
          sameSite: sameSite(),
        });
      }

      res.status(201).json({
        message: messagesConstant.en.completeRegistration,
      });
    }
    return;
  } else {
    res.sendStatus(500);
    return;
  }
};

export { handlePreRegister, handleOtp, handleSetUserName, handleSetPassword };
