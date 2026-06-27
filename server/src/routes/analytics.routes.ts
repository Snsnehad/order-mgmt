import { Router } from "express";
import { validate } from "../middlewares/validate";
import { analyticsQuerySchema, topItemsQuerySchema } from "../validators/analytics.validator";
import {
  ordersPerDayHandler,
  revenuePerStoreHandler,
  topSellingItemsHandler,
} from "../controllers/analytics.controller";

const router = Router();

router.get("/orders-per-day", validate(analyticsQuerySchema, "query"), ordersPerDayHandler);
router.get("/revenue-per-store", validate(analyticsQuerySchema, "query"), revenuePerStoreHandler);
router.get("/top-items", validate(topItemsQuerySchema, "query"), topSellingItemsHandler);

export default router;
