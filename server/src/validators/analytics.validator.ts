import { z } from "zod";

export const analyticsQuerySchema = z.object({
  store_id: z.string().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const topItemsQuerySchema = analyticsQuerySchema.extend({
  limit: z.coerce.number().int().positive().max(50).default(5),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type TopItemsQuery = z.infer<typeof topItemsQuerySchema>;
