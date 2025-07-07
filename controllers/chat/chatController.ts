import dotenv from "dotenv";
import { Request, Response } from "express";
import ChatModel from "../../model/chat";
import MessageModel from "../../model/message";

dotenv.config();

const getAllChatsController = async (req: Request, res: Response) => {
  const { main_id } = req.auth;

  try {
    const chats = await ChatModel.find({
      participants: { $in: main_id },
    }).populate({
      path: "createdBy",
      select: "username _id avatar",
      populate: {
        path: "avatar",
        select: "thumbnail_path",
      },
    });
    const count = await ChatModel.countDocuments({ createdBy: main_id });
    res.json({ message: "", data: { list: chats, count } });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getAllMessagesController = async (req: Request, res: Response) => {
  const { _id } = req.params;
  try {
    const posts = await MessageModel.find({
      _id,
    })
      .populate({
        path: "createdBy",
        select: "username _id avatar",
        populate: {
          path: "avatar",
          select: "thumbnail_path",
        },
      })
      .populate("address", "address location")
      .populate("medias", "file_path mime_type");
    const count = await MessageModel.countDocuments({ _id });
    res.json({ message: "", data: { list: posts, count } });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getPostsChatIdController = async (req: Request, res: Response) => {
  const { main_id } = req.auth;
  const { receiverId } = req.query;
  try {
    let chat = await ChatModel.findOne({
      participants: { $all: [main_id, receiverId], $size: 2 },
    });

    if (!chat) {
      chat = await ChatModel.create({
        createdBy: main_id,
        isGroup: false,
        participants: [main_id, receiverId],
      });
    }
    res.json({ chatId: chat._id });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

export {
  getAllChatsController,
  getAllMessagesController,
  getPostsChatIdController,
};
