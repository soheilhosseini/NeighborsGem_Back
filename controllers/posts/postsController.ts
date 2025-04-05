import { Request, Response } from "express";
import FileModel from "../../model/file";
import UserModel from "../../model/user";
import PostModel from "../../model/post";
import CommentModel from "../../model/comment";
import AddressModel from "../../model/address";
import ReactionModel from "../../model/reaction";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import messagesConstant from "../../constants/messages";
import address from "../../model/address";
import { distanceCalculator } from "../../utils/address";
import mongoose from "mongoose";

dotenv.config();

const addNewPostController = async (req: Request, res: Response) => {
  const { main_id, title, description, address_id } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  const editedFiles = files.map((file) => ({
    file_path: `/uploads/posts/${file.filename}`,
    mime_type: file.mimetype,
    size: file.size,
    created_at: Date.now(),
    created_by: main_id,
  }));

  try {
    const foundAddress = await AddressModel.findOne({ _id: address_id });

    const createdFiles = await FileModel.insertMany(editedFiles);
    await PostModel.insertOne({
      title,
      description,
      medias: createdFiles.map((item) => item._id),
      address: foundAddress,
      created_by: main_id,
    });
  } catch (err) {
    res.sendStatus(500);
  }

  res.status(201).json({ message: messagesConstant.en.postHasBeenCreated });
};

const getMyPostsController = async (req: Request, res: Response) => {
  const { main_id } = req.body;
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
      .populate("address", "address location")
      .populate("medias", "file_path mime_type");
    const count = await PostModel.countDocuments({ created_by: main_id });
    res.json({ message: "", data: { list: posts, count } });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getPostsController = async (req: Request, res: Response) => {
  const { main_id } = req.body;
  const { address_id } = req.query;

  const search = String(req.query.search || "").trim();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filters = {};

  if (address_id) {
    filters = {
      ...filters,
      "address._id": new mongoose.Types.ObjectId(address_id.toString()),
    };
  }

  const defaultAddress = await AddressModel.findOne({
    created_by: main_id,
    is_main_address: true,
  });

  let posts;
  if (defaultAddress?.location?.coordinates) {
    try {
      posts = await PostModel.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [
                defaultAddress.location.coordinates[0],
                defaultAddress.location.coordinates[1],
              ],
            },
            distanceField: "distance",
            spherical: true,
            key: "address.location", // Make sure Post has "address.location" indexed
          },
        },
        {
          $match: {
            ...filters,
            created_by: { $ne: new mongoose.Types.ObjectId(main_id) },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "created_by",
          },
        },
        { $unwind: "$created_by" },
        {
          $lookup: {
            from: "files",
            localField: "created_by.avatar",
            foreignField: "_id",
            as: "created_by.avatar",
          },
        },
        {
          $unwind: {
            path: "$created_by.avatar",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "files",
            localField: "medias",
            foreignField: "_id",
            as: "medias",
          },
        },
        {
          $sort: { distance: 1, created_at: -1 },
        },
        { $skip: skip }, // 👈 Pagination: skip (offset)
        { $limit: limit }, // 👈 Pagination: limit
        {
          $project: {
            title: 1,
            description: 1,
            created_at: 1,
            distance: 1,
            "medias.file_path": 1,
            "medias.mime_type": 1,
            "created_by.username": 1,
            "created_by._id": 1,
            "created_by.avatar.thumbnail_path": 1,
          },
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  } else {
    posts = await PostModel.aggregate([
      {
        $match: {
          ...filters,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "created_by",
        },
      },
      { $unwind: "$created_by" },
      {
        $lookup: {
          from: "files",
          localField: "created_by.avatar",
          foreignField: "_id",
          as: "created_by.avatar",
        },
      },
      {
        $unwind: {
          path: "$created_by.avatar",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "files",
          localField: "medias",
          foreignField: "_id",
          as: "medias",
        },
      },
      {
        $sort: { created_at: -1 },
      },
      { $skip: skip }, // 👈 Pagination: skip (offset)
      { $limit: limit }, // 👈 Pagination: limit
      {
        $project: {
          title: 1,
          description: 1,
          created_at: 1,
          "medias.file_path": 1,
          "medias.mime_type": 1,
          "created_by.username": 1,
          "created_by._id": 1,
          "created_by.avatar.thumbnail_path": 1,
        },
      },
    ]);
  }

  const count = await PostModel.countDocuments({
    ...filters,
    created_by: { $ne: new mongoose.Types.ObjectId(main_id) },
    "address.location": { $exists: true },
  });

  res.json({ message: "", data: { list: posts, count } });
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
      .populate("address", "address location")
      .populate("medias", "file_path mime_type");
    res.json({ message: "", data: { post } });
  } catch (err) {
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
      created_by: main_id,
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
      created_by: main_id,
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
