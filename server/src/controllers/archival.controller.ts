import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { archiveOldOrders } from "../services/archival.service";

export const archiveOldOrdersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const result = await archiveOldOrders();
  res.status(200).json({ success: true, data: result });
});
