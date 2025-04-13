import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const passwordSchema = z.object({
  user_identity: z.string().min(3),
  password: z.string().min(6),
});

export const validatePassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    passwordSchema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors });
    return;
  }
};
