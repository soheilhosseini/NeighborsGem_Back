import { Request, Response } from "express";
import FileModel from "../../model/file";
import UserModel from "../../model/user";
import PostModel from "../../model/post";
import CommentModel from "../../model/comment";
import AddressModel from "../../model/address";
import ReactionModel from "../../model/Reaction";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import messagesConstant from "../../constants/messages";

dotenv.config();

const addNewPostController = async (req: Request, res: Response) => {
  const { main_id, title, description, address_id } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  console.log(files);

  const editedFiles = files.map((file) => ({
    file_path: `/uploads/posts/${file.filename}`,
    mime_type: file.mimetype,
    size: file.size,
    created_at: Date.now(),
    created_by: main_id,
  }));

  try {
    const createdFiles = await FileModel.insertMany(editedFiles);
    await PostModel.insertOne({
      title,
      description,
      medias: createdFiles.map((item) => item._id),
      address: address_id,
      created_by: main_id,
    });
  } catch (err) {
    res.sendStatus(500);
  }

  res.status(201).json({ message: messagesConstant.en.postHasBeenCreated });
};

const getPostsController = async (req: Request, res: Response) => {
  const { main_id } = req.body;
  const { address_id } = req.query;
  let filters = {};

  if (address_id) {
    filters = {
      ...filters,
      address: address_id,
    };
  }

  const count = await PostModel.find({
    ...filters,
    created_by: { $ne: main_id },
  }).countDocuments();
  const posts = await PostModel.find({
    ...filters,
    created_by: { $ne: main_id },
  })
    .populate({
      path: "created_by",
      select: "username _id avatar",
      populate: {
        path: "avatar",
        select: "thumbnail_path",
      },
    })
    .populate("address", "address coordinate")
    .populate("medias", "file_path mime_type");

  const postIds = posts.map((post) => post._id);
  const reactions = await ReactionModel.aggregate([
    { $match: { post: { $in: postIds } } },
    {
      $group: {
        _id: { post: "$post", type: "$type" },
        count: { $sum: 1 },
      },
    },
  ]);

  const countsMap = new Map();

  // Group counts like { postId: { like: X, dislike: Y } }
  for (const r of reactions) {
    const postId = r._id.post.toString();
    const type = r._id.type;
    const count = r.count;

    if (!countsMap.has(postId)) countsMap.set(postId, { like: 0, dislike: 0 });
    countsMap.get(postId)[type] = count;
  }

  // Merge counts into posts
  const postsWithReactions = posts.map((post) => {
    const postObj = post.toObject();
    const reaction = countsMap.get(post._id.toString()) || {
      like: 0,
      dislike: 0,
    };
    return {
      ...postObj,
      likes_count: reaction.like,
      dislikes_count: reaction.dislike,
    };
  });

  res.json({ message: "", data: { list: postsWithReactions, count } });
};

const getPostDetailsController = async (req: Request, res: Response) => {
  const { _id } = req.params;

  if (!_id) {
    res.sendStatus(400);
  }

  try {
    const post = await PostModel.findOne({ _id })
      .populate({
        path: "created_by",
        select: "username _id avatar",
        populate: {
          path: "avatar",
          select: "thumbnail_path",
        },
      })
      .populate("address", "address coordinate")
      .populate("medias", "file_path mime_type");
    res.json({ message: "", data: { post } });
  } catch (err) {
    res.sendStatus(500);
  }
};

const getMyPostsController = async (req: Request, res: Response) => {
  const { main_id } = req.body;
  console.log(main_id, "asdfasd fasdf as fdsa d");
  try {
    const posts = await PostModel.find({
      created_by: main_id,
    })
      .populate({
        path: "created_by",
        select: "username _id avatar",
        populate: {
          path: "avatar",
          select: "thumbnail_path",
        },
      })
      .populate("address", "address coordinate")
      .populate("medias", "file_path mime_type");
    const count = await PostModel.countDocuments({ created_by: main_id });
    res.json({ message: "", data: { list: posts, count } });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const setPostReactionController = async (req: Request, res: Response) => {
  const { main_id, _id, type } = req.body;
  if (!_id || !type) {
    res.sendStatus(400);
    return;
  }

  try {
    await ReactionModel.insertOne({
      post_id: _id,
      user_id: main_id,
      type,
    });
    res.status(200).json({ messagesConstant: messagesConstant.en.reaction });
  } catch (err) {
    res.sendStatus(500);
  }
};

const deletePostReactionController = async (req: Request, res: Response) => {
  const { main_id, _id } = req.body;
  if (!_id) {
    res.sendStatus(400);
    return;
  }

  try {
    await ReactionModel.deleteOne({
      post_id: _id,
      user_id: main_id,
    });
    res
      .status(204)
      .json({ messagesConstant: messagesConstant.en.removeReaction });
  } catch (err) {
    res.sendStatus(500);
  }
};

const addNewCommentController = async (req: Request, res: Response) => {
  const { main_id, _id, text, parent_id } = req.body;
  if (!_id) {
    res.sendStatus(400);
  }
  try {
    const comment = await CommentModel.insertOne({
      created_by: main_id,
      post_id: _id,
      text,
      parent_id,
    });

    console.log(comment);

    const populateComment = await CommentModel.findOne({
      _id: comment._id,
    }).populate({
      path: "created_by",
      select: "username _id avatar",
      populate: {
        path: "avatar",
        select: "thumbnail_path",
      },
    });

    res.json({
      message: "",
      data: { comment: populateComment },
    });
  } catch (err) {
    res.sendStatus(500);
  }
};

const getPostsCommentsController = async (req: Request, res: Response) => {
  const { _id } = req.params;
  if (!_id) {
    res.sendStatus(400);
    return;
  }

  try {
    const comments = await CommentModel.find({ post_id: _id })
      .sort({ created_at: -1 })
      .populate({
        path: "created_by",
        select: "username _id avatar",
        populate: {
          path: "avatar",
          select: "thumbnail_path",
        },
      });
    const count = await CommentModel.countDocuments({ post_id: _id });
    res.json({ message: "", data: { list: comments, count } });
  } catch (err) {
    res.sendStatus(500);
  }
};

export {
  addNewPostController,
  getPostsController,
  getMyPostsController,
  setPostReactionController,
  deletePostReactionController,
  getPostDetailsController,
  addNewCommentController,
  getPostsCommentsController,
};
