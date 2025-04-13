import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    auth: {
      main_id: string;
      [key: string]: any;
    };
  }
}
