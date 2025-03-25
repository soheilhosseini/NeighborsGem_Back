import express from "express";
import {
  addNewPostController,
  getPostsController,
} from "../../../controllers/posts/postsController";
import upload from "../../../utils/multer"; // adjust path
import publicAuthentication from "../../../middleware/publicAuthentication";

const router = express.Router();

router.post("/add-new-post", upload.array("medias", 10), addNewPostController);
router.get("/", publicAuthentication, getPostsController);

export default router;
