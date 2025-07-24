import { Router } from "express";
const router = Router();

import pushNotificationRouter from "./pushNotification";
import verifyJWT from "../../../middleware/verifyJWT";

router.use(verifyJWT, pushNotificationRouter);

export default router;
