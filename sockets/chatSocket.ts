import type { Server, Socket } from "socket.io";
import ChatModel from "../model/chat";
import MessageModel from "../model/message";
import UserModel from "../model/user";
import MessageDeliveryModel from "../model/messageDelivery";
import mongoose from "mongoose";
import "../firebase/firebase";
import admin from "firebase-admin";

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

      const populatedMessage = await MessageModel.findById(
        savedMessage._id
      ).populate("createdBy");
      await MessageDeliveryModel.insertMany(
        chat.participants
          .filter(
            (participantId) => participantId.toString() !== userId.toString()
          )
          .map((participantId) => ({
            messageId: savedMessage._id,
            senderId: userId,
            receiverId: participantId,
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
            message: { ...populatedMessage?.toObject(), status: "sent" },
          });
        } else {
          const user = await UserModel.findOne({ _id: participantId });
          if (user && user.pushToken) {
            const message = {
              token: user.pushToken,
              notification: {
                title: `New message from ${
                  user.username ||
                  (user.first_name && user.first_name + " " + user.last_name) ||
                  user.email ||
                  user.phone_number
                }`,
                body: content,
              },
              webpush: {
                notification: {
                  click_action:
                    process.env.NODE_ENV === "development"
                      ? `https://192.168.1.6:3000/chats/${chatId}`
                      : "https://nesgem.com/chats/${chatId}",
                },
              },
            };
            admin
              .messaging()
              .send(message)
              .then((response) => console.log("Sent:", response))
              .catch((err) => console.error("Error:", err));
          }
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
        { messageId, receiverId: userId },
        {
          $set: { status: "delivered", updatedAt: new Date() },
        },
        { new: true }
      );

      // user is not in the chat
      if (!messageDelivery) {
        return;
      }

      const chatId = messageDelivery?.chatId;

      let chat = await ChatModel.findOne({
        _id: chatId,
      });

      //Broadcast to all participants except
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
      { messageId, receiverId: userId },
      {
        $set: { status: "read", updatedAt: new Date() },
      },
      { new: true }
    );

    // user is not in the chat
    if (!messageDelivery) {
      return;
    }

    const chatId = messageDelivery?.chatId;

    let chat = await ChatModel.findOne({
      _id: chatId,
    });

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
        }
      });
  });
}

const sendUndeliveredMessages = async (socket: Socket) => {
  const userId = socket.userId;

  const messages = await MessageDeliveryModel.aggregate([
    {
      $match: {
        receiverId: new mongoose.Types.ObjectId(userId),
        $or: [
          {
            status: "sent",
          },
          { status: "delivered" },
        ],
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "messageId",
        foreignField: "_id",
        as: "message",
      },
    },
    { $unwind: "$message" },

    // Lookup createdBy (User)
    {
      $lookup: {
        from: "users",
        localField: "message.createdBy",
        foreignField: "_id",
        as: "message.createdBy",
      },
    },
    { $unwind: "$message.createdBy" },

    // Lookup avatar inside createdBy
    {
      $lookup: {
        from: "files",
        localField: "message.createdBy.avatar",
        foreignField: "_id",
        as: "message.createdBy.avatar",
      },
    },
    {
      $unwind: {
        path: "$message.createdBy.avatar",
        preserveNullAndEmptyArrays: true, // allow null avatar
      },
    },

    // Return only the message
    {
      $replaceRoot: { newRoot: "$message" },
    },
  ]);

  for (const delivery of messages) {
    socket.emit("unread_messages", {
      chatId: delivery.chatId,
      message: delivery,
    });
  }
};

export { chatSocket, sendUndeliveredMessages };
