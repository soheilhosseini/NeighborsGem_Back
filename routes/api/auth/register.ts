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

router.post("/pre-register", validatePreRegister, handlePreRegister);
router.post("/register-verify-otp", validateOtp, handleOtp);
router.post("/register-set-username", validateUsername, handleSetUserName);
router.post("/register-set-password", validatePassword, handleSetPassword);

export default router;
