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
        chat.participants
          .filter(
            (participantId) => participantId.toString() !== userId.toString()
          )
          .map((participantId) => ({
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
            message: populatedMessage,
          });
          await MessageModel.findByIdAndUpdate(savedMessage._id, {
            $addToSet: { deliveredTo: participantId },
          });
        } else {
          //push notification
        }
      });
    } catch (err) {
      console.error(err);
      socket.emit("error", { msg: "Server error" });
    }
  });

  //Confirms message was delivered to client
  socket.on("message_delivered", async ({ messageId }) => {
    try {
      const userId = socket.userId;
      console.log(userId);
      const messageDelivery = await MessageDeliveryModel.findOneAndUpdate(
        { userId, messageId },
        {
          $set: { status: "delivered", updatedAt: new Date() },
        },
        { new: true }
      );
      console.log(messageDelivery);
      const chatId = messageDelivery?.chatId;
      console.log(chatId);

      let chat = await ChatModel.findOne({
        _id: chatId,
      });
      console.log(chat);

      // Broadcast to all participants except
      const rooms = io.sockets.adapter.rooms;
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
  socket.on("message_read", ({ messageId }) => {
    MessageDeliveryModel.updateOne(
      { userId: socket.userId, messageId },
      {
        $set: { status: "read", updatedAt: new Date() },
      }
    );
  });
}

const sendUndeliveredMessages = async (socket: Socket) => {
  const userId = socket.userId;
  const undelivered = await MessageDeliveryModel.find({
    userId,
    status: { $in: ["pending", "delivered"] },
  }).populate("messageId");

  for (const delivery of undelivered) {
    const msg = delivery.messageId as any;

    socket.emit("message", {
      chatId: msg.chatId,
      message: {
        _id: msg._id,
        content: msg.content,
        sender: msg.sender,
        createdAt: msg.createdAt,
      },
    });

    await MessageDeliveryModel.updateOne(
      { _id: delivery._id },
      { $set: { status: "delivered", updatedAt: new Date() } }
    );
  }
};

export { chatSocket, sendUndeliveredMessages };
