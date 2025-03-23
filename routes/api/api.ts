import { Router } from "express";
const router = Router();

import AuthRouter from "./auth";
import MeRouter from "./me";
import verifyJWT from "../../middleware/verifyJWT";

router.use("/auth", AuthRouter);
router.use("/me", verifyJWT, MeRouter);

export default router;
