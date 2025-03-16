import express from "express";
import {
  getMyInfo,
  createMyInfo,
  updateMyInfo,
  deleteMyInfo,
} from "../../controllers/meController";
const router = express.Router();

router
  .route("/")
  .get(getMyInfo)
  .post(createMyInfo)
  .put(updateMyInfo)
  .delete(deleteMyInfo);

router.route("/:id").get();

module.exports = router;
