const express = require("express");
const {
  getMyInfo,
  createMyInfo,
  updateMyInfo,
  deleteMyInfo,
} = require("/controllers/meController");
const router = express.Router();

router
  .route("/")
  .get(getMyInfo)
  .post(createMyInfo)
  .put(updateMyInfo)
  .delete(deleteMyInfo);

router.route("/:id").get();

module.exports = router;
