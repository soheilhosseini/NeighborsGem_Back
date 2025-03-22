import { Request, Response } from "express";
import UserModel from "../../model/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const myInfoController = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.access_token) {
    res.sendStatus(401);
    return;
  }
  try {
    jwt.verify(
      cookies.access_token,
      process.env.ACCESS_TOKEN_SECRET as string,
      async (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          res.sendStatus(401);
          return;
        }
        console.log(decoded, "dasfasdff");
        const user = await UserModel.findOne({
          $or: [
            { phone_number: decoded.user_identity },
            { email: decoded.user_identity },
          ],
        }).select("-refresh_tokens");
        console.log(user, "dasfasdff");

        res.json({ message: "", data: { user } });
      }
    );
  } catch (err) {
    res.sendStatus(400);
  }
};

export { myInfoController };
