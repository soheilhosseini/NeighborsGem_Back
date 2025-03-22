import express from "express";
const router = express.Router();
import {
  handleNewUser,
  handlePreRegister,
  handleOtp,
  handleSetUserName,
  handleSetPassword,
} from "../../../controllers/auth/registerController";

router.post("/pre-register", handlePreRegister);
router.post("/register-verify-otp", handleOtp);
router.post("/register-set-username", handleSetUserName);
router.post("/register-set-password", handleSetPassword);

router.post("/", handleNewUser);

export default router;
