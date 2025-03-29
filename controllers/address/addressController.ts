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
  const { limit, in_bbox } = req.query;

  console.log(req.query);

  if (!in_bbox || !limit) {
    res.sendStatus(400);
    return;
  }

  const transformedInBbox = in_bbox.toString().split(",");

  try {
    const addresses = await AddressModel.find({
      "coordinates.0": {
        $gte: Number(transformedInBbox[0]),
        $lte: Number(transformedInBbox[2]),
      },
      "coordinates.1": {
        $gte: Number(transformedInBbox[1]),
        $lte: Number(transformedInBbox[3]),
      },
      user_id: { $not: { $eq: main_id } },
    }).limit(+limit);
    res.json({ message: "", data: { list: addresses } });
  } catch (err) {
    res.sendStatus(500);
  }
};

export { getAllAddressesController };
