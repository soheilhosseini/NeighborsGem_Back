import express from "express";
const router = express.Router();
import { getAllAddressesController } from "../../../controllers/address/addressController";
import verifyJWT from "../../../middleware/verifyJWT";

router.get("/", verifyJWT, getAllAddressesController);

export default router;
