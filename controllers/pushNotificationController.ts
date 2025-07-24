import dotenv from "dotenv";
import { Request, Response } from "express";
import UserModel from "../model/user";

dotenv.config();

const pushNotificationController = async (req: Request, res: Response) => {
  const { main_id } = req.auth;
  const { token } = req.body;
  if (!token) {
    res.sendStatus(404);
  }

  try {
    const user = await UserModel.findByIdAndUpdate(main_id, {
      pushToken: req.body.token,
    });

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

export { pushNotificationController };
