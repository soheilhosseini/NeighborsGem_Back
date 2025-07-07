import { Server } from "socket.io";
import http from "http";
import { chatSocket, sendUndeliveredMessages } from "./sockets/chatSocket";
import type { Express } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as cookie from "cookie";
require("dotenv").config();

declare module "socket.io" {
  interface Socket {
    userId: mongoose.Types.ObjectId;
  }
}

const socketInitializer = (app: Express) => {
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const rawCookie = socket.handshake.headers.cookie || "";
    const parsed = cookie.parse(rawCookie);
    const access_token = parsed["access_token"] || "";
    try {
      if (process.env.ACCESS_TOKEN_SECRET) {
        jwt.verify(
          access_token,
          process.env.ACCESS_TOKEN_SECRET,
          (err: jwt.VerifyErrors | null, decoded: any) => {
            if (err) {
              next(new Error("Unauthorized"));
              return;
            }
            socket.userId = decoded._id;
            next();
          }
        );
      }
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("socket connection");
    socket.on("register", () => {
      socket.join(`user-${socket.userId}`);
      console.log(`🟢 New connection: ${socket.userId}`);
      sendUndeliveredMessages(socket);
    });
    chatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log(`🔴 Disconnected: ${socket.id}`);
    });
  });

  io.on("connect_error", (err) => {
    console.error("Socket error:", err.message, err);
  });

  return server;
};

export default socketInitializer;
