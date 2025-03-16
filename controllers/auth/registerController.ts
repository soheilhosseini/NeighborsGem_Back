import { Request, Response } from "express";
import messagesConstant from "../../constants/messages";
import bcrypt from "bcrypt";
import path from "path";
import UserModel from "../../model/user";
import TempUserModel from "../../model/tempUser";
import { emailValidator, phoneNumberValidator } from "../../utils/validation";

const handlePreRegister = async (req: Request, res: Response) => {
  const { user_identity } = req.body;
  console.log(user_identity);
  if (!user_identity) {
    res
      .status(400)
      .json({ message: messagesConstant.en.preRegisterEmptyField });
    return;
  }

  const foundedUser = await UserModel.findOne({
    $or: [
      { phone_number: user_identity },
      { email: user_identity },
      { user_name: user_identity },
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
      { phone_number: user_identity },
      { email: user_identity },
      { user_name: user_identity },
    ],
  });

  if (!foundedTempUser) {
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
    const tempUser = new TempUserModel(payload);
    await tempUser.save();
  } else {
    try {
      await TempUserModel.updateOne(
        { _id: foundedTempUser._id },
        { $set: { createAt: Date.now() } }
      );
    } catch (err) {
      console.log(err);
    }
  }

  res.status(201).json({ message: messagesConstant.en.optSent });
};

const handleNewUser = async (req: Request, res: Response) => {
  // const { user, pwd } = req.body;
  // if (!user | !pwd)
  //   return res
  //     .status(400)
  //     .json({ message: "Username and Password are required." });
  // const duplicate = usersDB.users.find((person) => person.username === user);
  // if (duplicate)
  //   return res.status(409).json({ message: "User was already created" });
  // try {
  //   const hashedPwd = await bcrypt.hash(pwd, 10);
  //   const newUser = { username: user, password: hashedPwd };
  //   usersDB.setUsers([...usersDB.users, newUser]);
  //   await fsPromises.writeFile(
  //     path.join(__dirname, "..", "model", "users.json"),
  //     JSON.stringify(usersDB.users)
  //   );
  //   console.log(usersDB.users);
  //   res.status(201).json({ success: `New user ${user} created!` });
  // } catch (err) {
  //   res.status(500).json({ message: err.message });
  // }
  res.sendStatus(200);
};

export { handlePreRegister, handleNewUser };
