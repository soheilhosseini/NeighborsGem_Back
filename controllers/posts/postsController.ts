import { Request, Response } from "express";
import UserModel from "../../model/user";
import PostModel from "../../model/post";
import AddressModel from "../../model/address";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import messagesConstant from "../../constants/messages";

dotenv.config();

const addNewPostController = async (req: Request, res: Response) => {
  const { title, description, address_id } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  const editedFiles = files.map((file) => `/uploads/${file.filename}`);

  try {
    await PostModel.insertOne({
      title,
      description,
      medias: editedFiles,
      address_id,
      // originalName: file.originalname,
      // mimeType: file.mimetype,
    });
  } catch (err) {
    res.sendStatus(500);
  }

  res.status(201).json({ message: messagesConstant.en.postHasBeenCreated });
};

const getPostsController = async (req: Request, res: Response) => {
  const { main_id } = req.body;
  const count = await PostModel.find({
    created_by: { $ne: main_id },
  }).countDocuments();
  const posts = await PostModel.find({
    created_by: { $ne: main_id },
  })
    .populate("created_by", "phone_number username _id")
    .populate("address_id", "address coordinates");
  console.log(main_id, posts);
  res.json({ message: "", data: { list: posts, count } });
};

export { addNewPostController, getPostsController };
