import { Router } from "express";
import orderRoutes from "./order.routes";
import archivalRoutes from "./archival.routes";
import analyticsRoutes from "./analytics.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));
router.use("/orders", orderRoutes);
router.use("/", archivalRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
