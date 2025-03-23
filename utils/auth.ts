import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function generateAccessToken(_id: string) {
  if (process.env.ACCESS_TOKEN_SECRET)
    return jwt.sign({ _id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1000000s",
    });
}

// export function generateRefreshToken(user_identity: string) {
//   if (process.env.REFRESH_SECRET)
//     return jwt.sign(user_identity, process.env.REFRESH_SECRET, {
//       expiresIn: "7d",
//     });
// }
