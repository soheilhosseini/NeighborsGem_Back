import { Router } from "express";
const router = Router();

import { default as registerRouter } from "./register";
import { default as loginRouter } from "./login";

router.use(registerRouter);
router.use(loginRouter);

export default router;
