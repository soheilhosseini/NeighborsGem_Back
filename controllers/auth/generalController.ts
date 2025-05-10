import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../../model/user";
import FileModel from "../../model/file";
import TempUserModel from "../../model/tempUser";
import { emailValidator, phoneNumberValidator } from "../../utils/validation";
import messagesConstant from "../../constants/messages";

dotenv.config();

const resendOTP = async (req: Request, res: Response) => {
  const { user_identity } = req.body;

  console.log(123);

  if (!user_identity) {
    res.sendStatus(400);
    return;
  }

  const foundedUser = await TempUserModel.findOne({
    $or: [
      { email: user_identity },
      { phone_number: user_identity },
      { username: user_identity },
    ],
  });

  if (!foundedUser) {
    const isPhoneNumberProvided = !isNaN(user_identity);
    let payload;
    if (!isPhoneNumberProvided) {
      if (emailValidator(user_identity)) {
        payload = { email: user_identity };
      } else {
        res.status(400).json({ message: messagesConstant.en.emailIsInvalid });
        return;
      }
    } else {
      if (phoneNumberValidator(user_identity)) {
        payload = { phone_number: user_identity };
      } else {
        res.status(400).json({ message: messagesConstant.en.phoneIsInvalid });
        return;
      }
    }
    const tempUser = new TempUserModel({ ...payload, otp: 123 });
    await tempUser.save();
    res.json({ message: messagesConstant.en.optSent });
  } else {
    await TempUserModel.updateOne(
      {
        $or: [
          { email: user_identity },
          { phone_number: user_identity },
          { username: user_identity },
        ],
      },
      { otp: "321" }
    );
  }
};

export { resendOTP };
