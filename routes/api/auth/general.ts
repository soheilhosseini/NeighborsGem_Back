import express from "express";
const router = express.Router();
import { resendOTP } from "../../../controllers/auth/generalController";

router.post("/resend-otp", resendOTP);

export default router;
