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

      const populatedMessage = await MessageModel.findById(
        savedMessage._id
      ).populate("createdBy");

      await MessageDeliveryModel.insertMany(
        chat.participants.map((participantId) => ({
          messageId: savedMessage._id,
          userId: participantId,
          status: "pending",
        }))
      );

      await ChatModel.updateOne(
        { _id: chatId },
        { lastMessage: savedMessage._id }
      );
      console.log(chat.participants);
      // Broadcast to all participants
      const rooms = io.sockets.adapter.rooms;
      console.log(rooms);

      callback({ status: "ok" });
      chat.participants.forEach(async (participantId) => {
        const sockets = await io.in(`user-${participantId}`).fetchSockets();
        const isUserOnline = sockets.length > 0;
        console.log(isUserOnline);
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
  socket.on("message-received", ({ messageId }) => {
    MessageDeliveryModel.updateOne(
      { userId: socket.userId, messageId },
      {
        $set: { status: "delivered", updatedAt: new Date() },
      }
    );
  });

  //Confirms message was read by client
  socket.on("message-read", ({ messageId }) => {
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
