import { Server, Socket } from "socket.io";
import https from "https";
import http from "http";
import { chatSocket, sendUndeliveredMessages } from "./sockets/chatSocket";
import type { Express } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as cookie from "cookie";
import fs from "fs";
require("dotenv").config();

declare module "socket.io" {
  interface Socket {
    userId: mongoose.Types.ObjectId;
  }
}

let io: Server;
const socketInitializer = (app: Express) => {
  const options = process.env.HTTPS
    ? {
        key: fs.readFileSync("192.168.1.6+1-key.pem"),
        cert: fs.readFileSync("192.168.1.6+1.pem"),
      }
    : {};

  const server = process.env.HTTPS
    ? https.createServer(options, app)
    : http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: process.env.HTTPS
        ? "https://localhost:3000"
        : "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    socket = socket;
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
      console.log(`🟢 New connection: ${socket.userId}`);
      socket.join(`user-${socket.userId}`);
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

export const getIo = () => io;

export default socketInitializer;
