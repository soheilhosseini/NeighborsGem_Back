import { Request, Response } from "express";
import UserModel from "../../model/user";
import AddressModel from "../../model/address";
import FileModel from "../../model/file";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import messagesConstant from "../../constants/messages";
import sharp from "sharp";
import path from "path";
import bcrypt from "bcrypt";
import { isValidPassword } from "../../utils/validation";
import fs from "fs";

dotenv.config();

const getMyInfoController = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.access_token) {
    res.sendStatus(401);
    return;
  }
  try {
    jwt.verify(
      cookies.access_token,
      process.env.ACCESS_TOKEN_SECRET as string,
      async (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          res.sendStatus(401);
          return;
        }
        const user = await UserModel.findOne({
          _id: decoded._id,
        })
          .populate("avatar");
        res.json({ message: "", data: { user } });
      }
    );
  } catch (err) {
    res.sendStatus(400);
  }
};

const updateMyInfoController = async (req: Request, res: Response) => {
  const { first_name, last_name, username } = req.body;
  const { main_id } = req.auth;
  if ((!first_name || !last_name) && !username) {
    res.status(400).json({ message: messagesConstant.en.emptyRequiredFileds });
    return;
  }
  const updateFileds: any = {};
  if (first_name && last_name) {
    updateFileds.first_name = first_name;
    updateFileds.last_name = last_name;
  }
  if (username) {
    updateFileds.username = username;
    const foundUser = await UserModel.findOne({
      username: { $regex: `^${username}$`, $options: "i" },
      _id: { $ne: main_id },
    });
    if (foundUser) {
      res.status(409).json({ message: messagesConstant.en.existUsername });
      return;
    }
  }
  try {
    await UserModel.findByIdAndUpdate(
      main_id,
      { $set: updateFileds },
      { new: true }
    );
    res.status(200).json({ message: messagesConstant.en.userInfoUpdated });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const updateMyPasswordController = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const { main_id } = req.auth;
  if (!newPassword) {
    res.status(400).json({ message: messagesConstant.en.emptyRequiredFileds });
    return;
  }

  const foundedUser = await UserModel.findOne({ _id: main_id });

  if (!foundedUser) {
    res.sendStatus(400);
    return;
  }
  let isPasswordMatch;
  if (foundedUser.password) {
    if (!currentPassword) {
      res.status(400).json({ message: messagesConstant.en.wrongPassword });
      return;
    }
    isPasswordMatch = await bcrypt.compare(
      currentPassword,
      foundedUser.password as string
    );
    if (!isPasswordMatch) {
      res.status(400).json({ message: messagesConstant.en.wrongPassword });
      return;
    }
  }

  if (!isValidPassword(newPassword)) {
    res.status(400).json({ message: messagesConstant.en.invalidPassword });
    return;
  }
  try {
    foundedUser.password = newPassword;
    await foundedUser.save();
    res.status(200).json({ message: messagesConstant.en.userInfoUpdated });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const sendUpdateEmailOTPController = async (req: Request, res: Response) => {
  const { email } = req.body;
  const { main_id } = req.auth;
  const isDuplicated = await UserModel.findOne({
    email,
    _id: { $not: { $eq: main_id } },
  });

  if (isDuplicated) {
    res.status(409).json({ message: messagesConstant.en.emailIsNotAvailable });
    return;
  }
  res.json({ message: messagesConstant.en.optSent });
};

const verifyUpdateEmailOTPController = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const { main_id } = req.auth;
  if (!email || !otp) {
    res.sendStatus(400);
  }

  if (otp === "123") {
    try {
      await UserModel.updateOne({ _id: main_id }, { $set: { email } });
      res.json({ message: messagesConstant.en.emailUpdatedSuccessfuly });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.status(400).json({ message: messagesConstant.en.wrongEmailUpdateOTP });
  }
};

const sendUpdatePhoneNumberOTPController = async (
  req: Request,
  res: Response
) => {
  const { phone_number } = req.body;
  const { main_id } = req.auth;
  const isDuplicated = await UserModel.findOne({
    phone_number,
    _id: { $not: { $eq: main_id } },
  });

  if (isDuplicated) {
    res
      .status(409)
      .json({ message: messagesConstant.en.phoneNumberIsNotAvailable });
    return;
  }

  res.json({ message: messagesConstant.en.optSent });
};

const verifyUpdatePhoneNumberOTPController = async (
  req: Request,
  res: Response
) => {
  const { phone_number, otp } = req.body;
  const { main_id } = req.auth;
  if (!phone_number || !otp) {
    res.sendStatus(400);
  }

  if (otp === "123") {
    try {
      await UserModel.updateOne({ _id: main_id }, { $set: { phone_number } });
      res.json({ message: messagesConstant.en.phoneNumberUpdatedSuccessfuly });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res
      .status(400)
      .json({ message: messagesConstant.en.wrongPhoneNumberUpdateOTP });
  }
};

const addNewAddressController = async (req: Request, res: Response) => {
  const { address, location } = req.body;
  const { main_id } = req.auth;

  if (!address || !location) {
    res.sendStatus(400);
  }
  try {
    await AddressModel.updateMany(
      { is_main_address: true, createdBy: main_id },
      { $set: { is_main_address: false } }
    );
    await AddressModel.insertOne({
      address,
      location,
      createdBy: main_id,
      is_main_address: true,
    });
    res
      .status(201)
      .json({ message: messagesConstant.en.addressCreatedSuccessfuly });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getMyAddressesController = async (req: Request, res: Response) => {
  const { main_id } = req.auth;
  try {
    const addresses = (await AddressModel.find({ createdBy: main_id })) || [];
    res.json({ message: "", data: { list: addresses } });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const setDefaultAddressController = async (req: Request, res: Response) => {
  const { _id } = req.body;
  const { main_id } = req.auth;
  if (!_id) {
    res.sendStatus(400);
    return;
  }
  try {
    await AddressModel.updateMany(
      { is_main_address: true, createdBy: main_id },
      { $set: { is_main_address: false } }
    );
    await AddressModel.updateOne({ _id }, { $set: { is_main_address: true } });
    res.json({ message: messagesConstant.en.defaultAddressWasSet });
    return;
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const deleteAddressController = async (req: Request, res: Response) => {
  const { _id } = req.body;
  const { main_id } = req.auth;

  if (!_id) {
    res.sendStatus(400);
    return;
  }
  try {
    await AddressModel.deleteOne({ createdBy: main_id, _id });
    res
      .status(204)
      .json({ message: messagesConstant.en.AddressDeletedSuccessfuly });
    return;
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const setAvatarController = async (req: Request, res: Response) => {
  const { main_id } = req.auth;
  if (!req.file) {
    res.sendStatus(400);
    return;
  }
  const file = req.file as Express.Multer.File;

  if (!file) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  const originalPath = file.path;
  const ext = path.extname(file.originalname);
  const nameWithoutExt = path.basename(file.originalname, ext);
  const thumbnailName = `${Date.now()}-${nameWithoutExt}-thumb${ext}`;
  const thumbnailPath = path.join(
    __dirname,
    "..",
    "..",
    "uploads",
    "avatars",
    "thumbnails",
    thumbnailName
  );
  try {
    await sharp(originalPath)
      .resize(160) // width of 300px, auto height
      .jpeg({ quality: 60 }) // lower quality = smaller size
      .toFile(thumbnailPath);

    const createdAvatar = await FileModel.insertOne({
      file_path: `/uploads/avatars/${file.filename}`,
      thumbnail_path: `/uploads/avatars/thumbnails/${thumbnailName}`,
      mime_type: file.mimetype,
      createdBy: main_id,
      type: "avatar",
    });
    const user = await UserModel.findOneAndUpdate(
      {
        _id: main_id,
      },
      { $set: { avatar: createdAvatar._id } },
      { new: true }
    ).populate({ path: "avatar" });

    const deletedFile = await FileModel.findOneAndDelete({
      createdBy: main_id,
      type: "avatar",
      _id: { $ne: createdAvatar._id },
    });
    if (deletedFile) {
      const absoluteFilePath = path.resolve(
        __dirname,
        "..",
        "..",
        deletedFile.file_path.slice(1)
      );
      const absoluteThumbnailPath = path.resolve(
        __dirname,
        "..",
        "..",
        deletedFile.thumbnail_path!.slice(1)
      );

      fs.unlink(absoluteFilePath, (err) => {
        console.log(err);
      });
      fs.unlink(absoluteThumbnailPath, (err) => {
        console.log(err);
      });
    }

    res
      .status(201)
      .json({ message: messagesConstant.en.avatarUpdated, data: user });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

export {
  getMyInfoController,
  updateMyInfoController,
  updateMyPasswordController,
  sendUpdateEmailOTPController,
  verifyUpdateEmailOTPController,
  sendUpdatePhoneNumberOTPController,
  verifyUpdatePhoneNumberOTPController,
  addNewAddressController,
  getMyAddressesController,
  setDefaultAddressController,
  deleteAddressController,
  setAvatarController,
};
