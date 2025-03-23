import { Request, Response } from "express";
import UserModel from "../../model/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const handleRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.access_token) return res.sendStatus(401);
  const refresh_token = cookies.refresh_token;

  const foundUser = await UserModel.findOne({
    refreshTokens: { $in: [refresh_token] },
  });

  if (!foundUser) {
    return res.sendStatus(403);
  }

  jwt.verify(
    refresh_token,
    process.env.REFRESH_TOKEN_SECRET as string,
    (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err || foundUser._id !== decoded._id) return res.sendStatus(403);
      const accessToken = jwt.sign(
        {
          _id: decoded._id,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
      );
      res.json({ accessToken });
    }
  );
};

export { handleRefreshToken };
