import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../model/user";

dotenv.config();
interface JWTDecoded {
  _id: string;
}

type CallbackFunction = (id: string) => void;
type ErrorFunction = (err: jwt.VerifyErrors | null) => void;

export const getMyIdFromAccessToken = (
  access_token: string,
  callBack: CallbackFunction,
  error: ErrorFunction
) => {
  jwt.verify(
    access_token,
    process.env.ACCESS_TOKEN_SECRET as string,
    async (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        error(err);
      }
      callBack((decoded as JWTDecoded)._id);
    }
  );
};

export const getMyInfo = async (_id: string) => {
  await UserModel.findOne({
    _id,
  });
};
