import { Router } from "express";
const router = Router();

import { default as registerRouter } from "./register";
import { default as loginRouter } from "./login";
import { default as generalRouter } from "./general";

router.use(registerRouter);
router.use(loginRouter);
router.use(generalRouter);

export default router;
