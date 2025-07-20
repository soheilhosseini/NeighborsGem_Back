import dotenv from "dotenv";
import { Request, Response } from "express";
import mongoose from "mongoose";
import messagesConstant from "../../constants/messages";
import AddressModel from "../../model/address";
import CommentModel from "../../model/comment";
import FileModel from "../../model/file";
import PostModel from "../../model/post";
import ReactionModel from "../../model/reaction";
import { getCategoriesFromHuggingFace } from "../../utils/post";
dotenv.config();

const addNewPostController = async (req: Request, res: Response) => {
  const { title, description, address_id } = req.body;
  const { main_id } = req.auth;
  const files = req.files as Express.Multer.File[];

  try {
    const foundAddress = await AddressModel.findOne({ _id: address_id });
    if (!foundAddress) {
      res.sendStatus(404);
      return;
    }
    let createdFiles;
    if (files) {
      const editedFiles = files.map((file) => ({
        file_path: `/uploads/posts/${file.filename}`,
        mime_type: file.mimetype,
        size: file.size,
        createdBy: main_id,
      }));
      createdFiles = await FileModel.insertMany(editedFiles);
    }

    // const existingCategoryDocs = await CategoryModel.find().select("name");
    // const existingNames = existingCategoryDocs.map((cat) => cat.name);

    const suggestedCategories = await getCategoriesFromHuggingFace(
      title + ". " + description
    );

    console.log(suggestedCategories);
    // const categories = [];
    // for (const name of suggestedCategories) {
    //   let category = await CategoryModel.findOne({ name });
    //   if (!category) {
    //     category = await CategoryModel.create({ name });
    //   }
    //   categories.push(category);
    // }

    const newPost = await PostModel.insertOne({
      title,
      description,
      medias: createdFiles?.map((item) => item._id) || [],
      address: foundAddress,
      createdBy: main_id,
      categories: suggestedCategories,
    });

    // const newPostWithCategory = await PostModel.findById(newPost._id).populate(
    //   "categories"
    // );

    res.status(201).json({
      message: messagesConstant.en.postHasBeenCreated,
      data: { post: newPost },
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getMyPostsController = async (req: Request, res: Response) => {
  const { main_id } = req.auth;

  try {
    const posts = await PostModel.find({
      createdBy: main_id,
    })
      .populate({
        path: "createdBy",
        select: "username _id avatar",
        populate: {
          path: "avatar",
          select: "thumbnail_path",
        },
      })
      .populate("address", "address location")
      .populate("medias", "file_path mime_type");
    const count = await PostModel.countDocuments({ createdBy: main_id });
    res.json({ message: "", data: { list: posts, count } });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const getPostsController = async (req: Request, res: Response) => {
  const { main_id } = req.auth;
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
    createdBy: main_id,
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
            createdBy: { $ne: new mongoose.Types.ObjectId(main_id) },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        { $unwind: "$createdBy" },
        {
          $lookup: {
            from: "files",
            localField: "createdBy.avatar",
            foreignField: "_id",
            as: "createdBy.avatar",
          },
        },
        {
          $unwind: {
            path: "$createdBy.avatar",
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
          $sort: { distance: 1, createdAt: -1 },
        },
        { $skip: skip }, // 👈 Pagination: skip (offset)
        { $limit: limit }, // 👈 Pagination: limit
        {
          $project: {
            title: 1,
            description: 1,
            createdAt: 1,
            distance: 1,
            "medias.file_path": 1,
            "medias.mime_type": 1,
            "createdBy.username": 1,
            "createdBy._id": 1,
            "createdBy.avatar.thumbnail_path": 1,
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
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      { $unwind: "$createdBy" },
      {
        $lookup: {
          from: "files",
          localField: "createdBy.avatar",
          foreignField: "_id",
          as: "createdBy.avatar",
        },
      },
      {
        $unwind: {
          path: "$createdBy.avatar",
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
        $sort: { createdAt: -1 },
      },
      { $skip: skip }, // 👈 Pagination: skip (offset)
      { $limit: limit }, // 👈 Pagination: limit
      {
        $project: {
          title: 1,
          description: 1,
          createdAt: 1,
          "medias.file_path": 1,
          "medias.mime_type": 1,
          "createdBy.username": 1,
          "createdBy._id": 1,
          "createdBy.avatar.thumbnail_path": 1,
        },
      },
    ]);
  }

  const count = await PostModel.countDocuments({
    ...filters,
    createdBy: { $ne: new mongoose.Types.ObjectId(main_id) },
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
        path: "createdBy",
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
    console.log(err);
    res.sendStatus(500);
  }
};

const setPostReactionController = async (req: Request, res: Response) => {
  const { _id, type } = req.body;
  const { main_id } = req.auth;
  if (!_id || !type) {
    res.sendStatus(400);
    return;
  }

  try {
    await ReactionModel.insertOne({
      post_id: _id,
      createdBy: main_id,
      type,
    });
    res.status(200).json({ messagesConstant: messagesConstant.en.reaction });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const deletePostReactionController = async (req: Request, res: Response) => {
  const { _id } = req.body;
  const { main_id } = req.auth;
  if (!_id) {
    res.sendStatus(400);
    return;
  }

  try {
    await ReactionModel.deleteOne({
      post_id: _id,
      createdBy: main_id,
    });
    res
      .status(204)
      .json({ messagesConstant: messagesConstant.en.removeReaction });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const addNewCommentController = async (req: Request, res: Response) => {
  const { _id, text, parent_id } = req.body;
  const { main_id } = req.auth;
  if (!_id) {
    res.sendStatus(400);
  }
  try {
    const comment = await CommentModel.insertOne({
      createdBy: main_id,
      post_id: _id,
      text,
      parent_id,
    });

    const populateComment = await CommentModel.findOne({
      _id: comment._id,
    }).populate({
      path: "createdBy",
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
    console.log(err);
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
      .sort({ createdAt: -1 })
      .populate({
        path: "createdBy",
        select: "username _id avatar",
        populate: {
          path: "avatar",
          select: "thumbnail_path",
        },
      });
    const count = await CommentModel.countDocuments({ post_id: _id });
    res.json({ message: "", data: { list: comments, count } });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

export {
  addNewCommentController,
  addNewPostController,
  deletePostReactionController,
  getMyPostsController,
  getPostDetailsController,
  getPostsCommentsController,
  getPostsController,
  setPostReactionController,
};
