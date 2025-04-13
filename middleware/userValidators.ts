import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const updateUserSchema = z.object({
  first_name: z.string().min(2).max(30).optional(),
  last_name: z.string().min(2).max(30).optional(),
});

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    updateUserSchema.parse(req.body);
    next();
  } catch (err: any) {
    return res.status(400).json({ error: err.errors });
  }
};
