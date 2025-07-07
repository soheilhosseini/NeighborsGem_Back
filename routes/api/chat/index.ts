import { Router } from "express";
const router = Router();

import chatRouter from "./chat";

router.use(chatRouter);

export default router;
