import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const otpSchema = z.object({
  otp: z.string().min(3),
  user_identity: z.string().min(3),
});

export const validateOtp = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    otpSchema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors });
    return;
  }
};
