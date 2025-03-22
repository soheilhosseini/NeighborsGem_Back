import { Router } from "express";
const router = Router();

import myInfoRouter from "./myInfo";

router.use(myInfoRouter);

export default router;
