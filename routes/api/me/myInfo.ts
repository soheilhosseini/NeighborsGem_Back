import express from "express";
const router = express.Router();
import {
  addNewAddressController,
  getMyInfoController,
  updateMyInfoController,
  sendUpdateEmailOTPController,
  verifyUpdateEmailOTPController,
  sendUpdatePhoneNumberOTPController,
  verifyUpdatePhoneNumberOTPController,
  getMyAddressesController,
  setDefaultAddressController,
  deleteAddressController,
  setAvatarController,
  updateMyPasswordController,
} from "../../../controllers/me/myInfoController";
import { upload, storage } from "../../../utils/multer"; // adjust path
import verifyJWT from "../../../middleware/verifyJWT";

router.get("/my-info", getMyInfoController);
router.put("/my-info", updateMyInfoController);

router.post("/my-info/add-new-address", addNewAddressController);
router.get("/my-info/get-my-addresses", getMyAddressesController);
router.post("/my-info/set-default-address", setDefaultAddressController);
router.delete("/my-info/delete-address", deleteAddressController);

router.post("/my-info/send-update-email-otp", sendUpdateEmailOTPController);
router.post("/my-info/verify-update-email-otp", verifyUpdateEmailOTPController);

router.post(
  "/my-info/send-update-phone-number-otp",
  sendUpdatePhoneNumberOTPController
);
router.post(
  "/my-info/verify-update-phone-number-otp",
  verifyUpdatePhoneNumberOTPController
);
router.post(
  "/my-info/set-avatar",
  upload(storage("uploads/avatars")).single("media"),
  verifyJWT,
  setAvatarController
);
router.put("/my-info/password", verifyJWT, updateMyPasswordController);

export default router;
