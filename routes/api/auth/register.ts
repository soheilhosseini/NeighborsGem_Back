import express from "express";
const router = express.Router();
import {
  handleNewUser,
  handlePreRegister,
} from "../../../controllers/auth/registerController";

router.post("/pre-register", handlePreRegister);

router.post("/", handleNewUser);

export default router;
