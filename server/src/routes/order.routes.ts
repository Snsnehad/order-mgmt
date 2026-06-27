import { Router } from "express";
import { validate } from "../middlewares/validate";
import {
  createOrderSchema,
  listOrdersQuerySchema,
  updateStatusSchema,
} from "../validators/order.validator";
import {
  createOrderHandler,
  listOrdersHandler,
  getOrderHandler,
  updateOrderStatusHandler,
} from "../controllers/order.controller";

const router = Router();

router.post("/", validate(createOrderSchema, "body"), createOrderHandler);
router.get("/", validate(listOrdersQuerySchema, "query"), listOrdersHandler);
router.get("/:id", getOrderHandler);
router.patch("/:id/status", validate(updateStatusSchema, "body"), updateOrderStatusHandler);

export default router;
