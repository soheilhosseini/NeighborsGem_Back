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

const getAllAddressesController = async (req: Request, res: Response) => {
  const { main_id } = req.body;
  const { limit = 10, in_bbox } = req.query;

  console.log(req.query);

  // if (!in_bbox || !limit) {
  //   res.sendStatus(400);
  //   return;
  // }

  let filters = {};

  const transformedInBbox = in_bbox?.toString().split(",");
  if (transformedInBbox) {
    filters = {
      ...filters,
      "coordinate.0": {
        $gte: Number(transformedInBbox[0]),
        $lte: Number(transformedInBbox[2]),
      },
      "coordinate.1": {
        $gte: Number(transformedInBbox[1]),
        $lte: Number(transformedInBbox[3]),
      },
    };
  }

  try {
    const addresses = await AddressModel.find({
      ...filters,
      created_by: { $not: { $eq: main_id } },
    }).limit(+limit);
    res.json({ message: "", data: { list: addresses } });
  } catch (err) {
    res.sendStatus(500);
  }
};

export { getAllAddressesController };
