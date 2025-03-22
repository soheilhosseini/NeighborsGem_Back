import express from "express";
const router = express.Router();
import { myInfoController } from "../../../controllers/me/myInfoController";

router.get("/my-info", myInfoController);

export default router;
