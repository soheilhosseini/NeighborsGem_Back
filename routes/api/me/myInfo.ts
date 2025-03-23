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
} from "../../../controllers/me/myInfoController";

router.get("/my-info", getMyInfoController);
router.put("/my-info", updateMyInfoController);

router.post("/my-info/add-new-address", addNewAddressController);

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

export default router;
