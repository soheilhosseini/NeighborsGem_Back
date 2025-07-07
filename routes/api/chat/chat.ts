import express from "express";
import {
  getAllChatsController,
  getAllMessagesController,
  getPostsChatIdController,
} from "../../../controllers/chat/chatController";
import verifyJWT from "../../../middleware/verifyJWT";

const router = express.Router();
router.get("/post-chatId", verifyJWT, getPostsChatIdController);
router.get("/:_id/messages", verifyJWT, getAllMessagesController);
router.get("/", verifyJWT, getAllChatsController);

export default router;
