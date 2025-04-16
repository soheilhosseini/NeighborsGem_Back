import express from "express";
const router = express.Router();
import { getAllAddressesController } from "../../../controllers/address/addressController";
import publicAuthentication from "../../../middleware/publicAuthentication";

router.get("/", publicAuthentication, getAllAddressesController);

export default router;
