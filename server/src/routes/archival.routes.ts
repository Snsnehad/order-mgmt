import { Router } from "express";
import { archiveOldOrdersHandler } from "../controllers/archival.controller";

const router = Router();

router.post("/archive-old-orders", archiveOldOrdersHandler);

export default router;
