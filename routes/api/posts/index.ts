import { Router } from "express";
const router = Router();

import postRouter from "./post";

router.use(postRouter);

export default router;
