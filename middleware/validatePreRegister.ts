import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import messagesConstant from "../constants/messages";

const preRegisterSchema = z.object({
  user_identity: z.string().min(3),
});

export const validatePreRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    preRegisterSchema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ message: messagesConstant.en.tooSmall });
    return;
  }
};
