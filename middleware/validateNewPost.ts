import z from "zod";
import { Request, Response, NextFunction } from "express";
const postSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  address_id: z.string().min(10),
});

export const validateNewPost = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    postSchema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors });
    return;
  }
};
