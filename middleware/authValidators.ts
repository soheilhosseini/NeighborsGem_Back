import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const loginSchema = z.object({
  user_identity: z.string().min(3),
  password: z.string().min(6),
});

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (err: any) {
    return res.status(400).json({ error: err.errors });
  }
};
