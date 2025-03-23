import express from "express";
const router = express.Router();
import {
  loginWithOTPCheckOTPController,
  loginWithOTPGetUserIdentityController,
  loginWithPasswordController,
} from "../../../controllers/auth/loginController";

router.post("/login-password", loginWithPasswordController);
router.post("/login-otp-get-identity", loginWithOTPGetUserIdentityController);
router.post("/login-otp-check-otp", loginWithOTPCheckOTPController);

export default router;
