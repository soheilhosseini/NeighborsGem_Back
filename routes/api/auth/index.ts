import { Router } from "express";
const router = Router();

import { default as registerRouter } from "./register";

router.use(registerRouter);

export default router;
