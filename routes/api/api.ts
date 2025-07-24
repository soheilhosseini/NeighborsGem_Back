import { Router } from "express";
const router = Router();

import AuthRouter from "./auth";
import MeRouter from "./me";
import verifyJWT from "../../middleware/verifyJWT";
import PostsRouter from "./posts";
import AddressRouter from "./address";
import ChatRouter from "./chat";
import NotificationRouter from "./notification";
router.use("/auth", AuthRouter);
router.use("/me", verifyJWT, MeRouter);
router.use("/posts", PostsRouter);
router.use("/address", AddressRouter);
router.use("/chats", ChatRouter);
router.use("/notification", NotificationRouter);

export default router;
