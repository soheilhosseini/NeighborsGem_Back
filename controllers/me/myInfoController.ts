import { Request, Response } from "express";
import UserModel from "../../model/user";
import AddressModel from "../../model/address";
import FileModel from "../../model/file";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import messagesConstant from "../../constants/messages";
import sharp from "sharp";
import path from "path";

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
        }).populate("avatar");
        res.json({ message: "", data: { user } });
      }
    );
  } catch (err) {
    res.sendStatus(400);
  }
};

const updateMyInfoController = async (req: Request, res: Response) => {
  const { main_id, first_name, last_name, username } = req.body;
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
      username,
      _id: { $not: { $eq: main_id } },
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
    res.sendStatus(500);
  }
};

const sendUpdateEmailOTPController = async (req: Request, res: Response) => {
  const { email, main_id } = req.body;

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
  const { email, otp, main_id } = req.body;

  if (!email || !otp) {
    res.sendStatus(400);
  }

  if (otp === "123") {
    try {
      await UserModel.updateOne({ _id: main_id }, { $set: { email } });
      res.json({ message: messagesConstant.en.emailUpdatedSuccessfuly });
    } catch (err) {
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
  const { phone_number, main_id } = req.body;

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
  const { phone_number, otp, main_id } = req.body;

  if (!phone_number || !otp) {
    res.sendStatus(400);
  }

  if (otp === "123") {
    try {
      await UserModel.updateOne({ _id: main_id }, { $set: { phone_number } });
      res.json({ message: messagesConstant.en.phoneNumberUpdatedSuccessfuly });
    } catch (err) {
      res.sendStatus(500);
    }
  } else {
    res
      .status(400)
      .json({ message: messagesConstant.en.wrongPhoneNumberUpdateOTP });
  }
};

const addNewAddressController = async (req: Request, res: Response) => {
  const { main_id, address, location } = req.body;

  if (!address || !location) {
    res.sendStatus(400);
  }
  try {
    await AddressModel.updateMany(
      { is_main_address: true, created_by: main_id },
      { $set: { is_main_address: false } }
    );
    await AddressModel.insertOne({
      address,
      location,
      created_by: main_id,
      is_main_address: true,
    });
    res
      .status(201)
      .json({ message: messagesConstant.en.addressCreatedSuccessfuly });
  } catch (err) {
    res.sendStatus(500);
  }
};

const getMyAddressesController = async (req: Request, res: Response) => {
  const { main_id } = req.body;
  console.log(main_id);
  try {
    const addresses = (await AddressModel.find({ created_by: main_id })) || [];
    res.json({ message: "", data: { addresses } });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const setDefaultAddressController = async (req: Request, res: Response) => {
  const { main_id, _id } = req.body;
  if (!_id) {
    res.sendStatus(400);
    return;
  }
  try {
    await AddressModel.updateMany(
      { is_main_address: true, created_by: main_id },
      { $set: { is_main_address: false } }
    );
    await AddressModel.updateOne({ _id }, { $set: { is_main_address: true } });
    res.json({ message: messagesConstant.en.defaultAddressWasSet });
    return;
  } catch (err) {
    res.sendStatus(500);
  }
};

const deleteAddressController = async (req: Request, res: Response) => {
  const { main_id, _id } = req.body;

  if (!_id) {
    res.sendStatus(400);
    return;
  }
  try {
    await AddressModel.deleteOne({ created_by: main_id, _id });
    res
      .status(204)
      .json({ message: messagesConstant.en.AddressDeletedSuccessfuly });
    return;
  } catch (err) {
    res.sendStatus(500);
  }
};

const setAvatarController = async (req: Request, res: Response) => {
  const { main_id } = req.body;
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
      created_at: Date.now(),
      file_path: `/uploads/avatars/${file.filename}`,
      thumbnail_path: `/uploads/avatars/thumbnails/${thumbnailName}`,
      mime_type: file.mimetype,
      created_by: main_id,
    });
    console.log(createdAvatar, main_id);
    await UserModel.updateOne(
      {
        _id: main_id,
      },
      { $set: { avatar: createdAvatar._id } }
    );
    res.status(201).json({ message: messagesConstant.en.avatarUpdated });
  } catch (err) {
    res.sendStatus(500);
  }
};

export {
  getMyInfoController,
  updateMyInfoController,
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
