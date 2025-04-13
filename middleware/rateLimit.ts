import rateLimit from "express-rate-limit";
import messagesConstant from "../constants/messages";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ۱۵ دقیقه
  max: 100, // حداکثر ۱۰۰ درخواست
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // ۵ دقیقه
  max: 10, // حداکثر ۱۰ بار تلاش ورود
  message: messagesConstant.en.tooManyRequest,
  standardHeaders: true,
  legacyHeaders: false,
});
