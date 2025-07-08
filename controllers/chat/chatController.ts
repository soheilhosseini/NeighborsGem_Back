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
    })
      //FIX ME: it will populate all memebers. its not good aproach for group chats with lots of memebers
      .populate({
        path: "participants",
        select: "username _id avatar first_name last_name email",
        populate: {
          path: "avatar",
          select: "thumbnail_path",
        },
      })
      .populate({
        path: "lastMessage",
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
  const { main_id } = req.auth;
  try {
    const chat = await ChatModel.findOne({
      _id,
      participants: { $in: main_id },
    });

    if (!chat) {
      res.sendStatus(404);
      return;
    }

    const messages = await MessageModel.find({
      chatId: _id,
    })
      .populate({
        path: "createdBy",
        select: "username avatar",
        populate: {
          path: "avatar",
          select: "thumbnail_path",
        },
      })
      .sort({ createdAt: -1 });

    const count = await MessageModel.countDocuments({ _id });
    res.json({ message: "", data: { list: messages, count } });
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
