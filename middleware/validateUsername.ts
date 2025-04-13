import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const usernameSchema = z.object({
  username: z.string().min(3).max(30),
  user_identity: z.string().min(3),
});

export const validateUsername = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    usernameSchema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors });
    return;
  }
};
