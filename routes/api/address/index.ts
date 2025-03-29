import { Router } from "express";
const router = Router();

import { default as addressRouter } from "./address";
router.use(addressRouter);

export default router;
