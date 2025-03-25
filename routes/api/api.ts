import { Router } from "express";
const router = Router();

import AuthRouter from "./auth";
import MeRouter from "./me";
import verifyJWT from "../../middleware/verifyJWT";
import PostsRouter from "./posts";

router.use("/auth", AuthRouter);
router.use("/me", verifyJWT, MeRouter);
router.use("/posts", PostsRouter);

export default router;
