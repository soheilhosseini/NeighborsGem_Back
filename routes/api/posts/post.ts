import express from "express";
import {
  addNewPostController,
  getPostsController,
  setPostReactionController,
  getMyPostsController,
  getPostDetailsController,
  addNewCommentController,
  getPostsCommentsController,
} from "../../../controllers/posts/postsController";
import { upload, storage } from "../../../utils/multer"; // adjust path
import publicAuthentication from "../../../middleware/publicAuthentication";
import verifyJWT from "../../../middleware/verifyJWT";

const router = express.Router();
router.post(
  "/add-new-post",
  upload(storage("uploads/posts")).array("medias", 10),
  verifyJWT,
  addNewPostController
);
router.post("/add-new-comment", verifyJWT, addNewCommentController);
router.get("/:_id/get-comments", getPostsCommentsController);
router.post("/reaction", verifyJWT, setPostReactionController);
router.get("/my-posts", verifyJWT, getMyPostsController);
router.get("/:_id", getPostDetailsController);
router.get("/", publicAuthentication, getPostsController);

export default router;
