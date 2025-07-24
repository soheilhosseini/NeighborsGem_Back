import { Router } from "express";
import { pushNotificationController } from "../../../controllers/pushNotificationController";
const router = Router();

router.post("/push-notification-token", pushNotificationController);

export default router;
