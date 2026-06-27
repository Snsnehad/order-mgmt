import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as analyticsService from "../services/analytics.service";
import { AnalyticsQuery, TopItemsQuery } from "../validators/analytics.validator";

export const ordersPerDayHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AnalyticsQuery;
  const data = await analyticsService.getOrdersPerDay(query);
  res.status(200).json({ success: true, data });
});

export const revenuePerStoreHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AnalyticsQuery;
  const data = await analyticsService.getRevenuePerStore(query);
  res.status(200).json({ success: true, data });
});

export const topSellingItemsHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as TopItemsQuery;
  const data = await analyticsService.getTopSellingItems(query, query.limit);
  res.status(200).json({ success: true, data });
});
