import type { Server, Socket } from "socket.io";
import ChatModel from "../model/chat";
import MessageModel, { MessageType } from "../model/message";
import mongoose from "mongoose";
import MessageDeliveryModel from "../model/messageDelivery";

function chatSocket(io: Server, socket: Socket) {
  // Client Sent a message
  socket.on("message", async ({ content, chatId }, callback) => {
    const userId = socket.userId;
    try {
      let chat = await ChatModel.findOne({
        _id: chatId,
      });

      if (!chat) {
        socket.emit("error", { msg: "Server error" });
        return;
      }

      // Save message to DB
      const savedMessage = await MessageModel.create({
        chatId,
        createdBy: userId,
        content,
        createdAt: new Date(),
      });

      const populatedMessage = await MessageModel.findById(savedMessage._id)
        .populate("createdBy")
        .select("-password");
      await MessageDeliveryModel.insertMany(
        chat.participants.map((participantId) => ({
          messageId: savedMessage._id,
          userId: participantId,
          status: "sent",
          chatId,
        }))
      );

      await ChatModel.updateOne(
        { _id: chatId },
        { lastMessage: savedMessage._id }
      );

      callback({ status: "ok" });
      chat.participants.forEach(async (participantId) => {
        const sockets = await io.in(`user-${participantId}`).fetchSockets();
        const isUserOnline = sockets.length > 0;
        if (isUserOnline) {
          io.to(`user-${participantId}`).emit("message", {
            chatId: chat._id,
            message: { ...populatedMessage?.toObject(), status: "sent" },
          });
          await MessageModel.findByIdAndUpdate(savedMessage._id, {
            $addToSet: { deliveredTo: participantId },
          });
        } else {
          //push notification
        }
      });
    } catch (err) {
      callback({ status: "error" });
      console.error(err);
      socket.emit("error", { msg: "Server error" });
    }
  });

  //Confirms message was delivered to client
  socket.on("message_delivered", async ({ messageId }) => {
    try {
      const userId = socket.userId;

      const messageDelivery = await MessageDeliveryModel.findOneAndUpdate(
        { messageId },
        {
          $set: { status: "delivered", updatedAt: new Date() },
        },
        { new: true }
      );

      const chatId = messageDelivery?.chatId;

      let chat = await ChatModel.findOne({
        _id: chatId,
      });

      if (!chat?.participants.includes(userId)) {
        return;
      }

      // Broadcast to all participants except
      chat?.participants
        .filter((participantId) => participantId !== userId)
        .forEach(async (participantId) => {
          const sockets = await io.in(`user-${participantId}`).fetchSockets();
          const isUserOnline = sockets.length > 0;
          if (isUserOnline) {
            io.to(`user-${participantId}`).emit("message_delivered", {
              chatId,
              messageId,
            });
          } else {
            //push notification
          }
        });
    } catch (err) {
      console.log(err);
    }
  });

  //Confirms message was read by client
  socket.on("message_read", async ({ messageId }) => {
    const userId = socket.userId;
    const messageDelivery = await MessageDeliveryModel.findOneAndUpdate(
      { messageId },
      {
        $set: { status: "delivered", updatedAt: new Date() },
      },
      { new: true }
    );

    const chatId = messageDelivery?.chatId;

    let chat = await ChatModel.findOne({
      _id: chatId,
    });

    if (!chat?.participants.includes(userId)) {
      return;
    }
    await MessageDeliveryModel.updateOne(
      { messageId },
      {
        $set: { status: "read", updatedAt: new Date() },
      }
    );

    chat?.participants
      .filter((participantId) => participantId !== userId)
      .forEach(async (participantId) => {
        const sockets = await io.in(`user-${participantId}`).fetchSockets();
        const isUserOnline = sockets.length > 0;
        if (isUserOnline) {
          io.to(`user-${participantId}`).emit("message_read", {
            chatId,
            messageId,
          });
        } else {
          //push notification
        }
      });
  });
}

const sendUndeliveredMessages = async (socket: Socket) => {
  const userId = socket.userId;

  const messages = await MessageDeliveryModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "sent",
      },
    },
    // {
    //   $lookup: {
    //     from: "messages",
    //     localField: "messageId",
    //     foreignField: "_id",
    //     as: "message",
    //   },
    // },
    // { $unwind: "$message" },

    // // Lookup createdBy (User)
    // {
    //   $lookup: {
    //     from: "users",
    //     localField: "message.createdBy",
    //     foreignField: "_id",
    //     as: "message.createdBy",
    //   },
    // },
    // { $unwind: "$message.createdBy" },

    // // Lookup avatar inside createdBy
    // {
    //   $lookup: {
    //     from: "files",
    //     localField: "message.createdBy.avatar",
    //     foreignField: "_id",
    //     as: "message.createdBy.avatar",
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$message.createdBy.avatar",
    //     preserveNullAndEmptyArrays: true, // allow null avatar
    //   },
    // },

    // // Return only the message
    // {
    //   $replaceRoot: { newRoot: "$message" },
    // },
  ]);
  console.log(messages);
  for (const delivery of messages) {
    console.log(delivery);

    // socket.emit("message", {
    //   chatId: msg.chatId,
    //   message: msg,
    // });
  }
};

export { chatSocket, sendUndeliveredMessages };
