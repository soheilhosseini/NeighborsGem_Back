import { Router } from "express";
const router = Router();

import AuthRouter from "./auth";
import MeRouter from "./me";

router.use("/auth", AuthRouter);
router.use("/me", MeRouter);

export default router;
