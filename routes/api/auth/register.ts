import express from "express";
const router = express.Router();
import {
  handlePreRegister,
  handleOtp,
  handleSetUserName,
  handleSetPassword,
} from "../../../controllers/auth/registerController";
import { validatePreRegister } from "../../../middleware/validatePreRegister";
import { validateOtp } from "../../../middleware/validateOtp";
import { validateUsername } from "../../../middleware/validateUsername";
import { validatePassword } from "../../../middleware/validatePassword";
import { authLimiter } from "../../../middleware/rateLimit";

router.post(
  "/pre-register",
  authLimiter,
  validatePreRegister,
  handlePreRegister
);
router.post("/register-verify-otp", authLimiter, validateOtp, handleOtp);
router.post(
  "/register-set-username",
  authLimiter,
  validateUsername,
  handleSetUserName
);
router.post(
  "/register-set-password",
  authLimiter,
  validatePassword,
  handleSetPassword
);

export default router;
