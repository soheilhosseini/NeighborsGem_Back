import express from "express";
const router = express.Router();
import {
  loginWithGoogleController,
  loginWithOTPCheckOTPController,
  loginWithOTPGetUserIdentityController,
  loginWithPasswordController,
  logoutController,
  recaptchaController,
} from "../../../controllers/auth/loginController";
import { authLimiter } from "../../../middleware/rateLimit";

router.post("/login-password", authLimiter, loginWithPasswordController);
router.post(
  "/login-otp-get-identity",
  authLimiter,
  loginWithOTPGetUserIdentityController
);
router.post(
  "/login-otp-check-otp",
  authLimiter,
  loginWithOTPCheckOTPController
);
router.post("/google", authLimiter, loginWithGoogleController);

router.post("/recaptcha", recaptchaController);
router.post("/logout", logoutController);

export default router;
