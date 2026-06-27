import { Order } from "../models/order.model";
import { OrderArchive } from "../models/orderArchive.model";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface ArchiveResult {
  archived_count: number;
  cutoff_date: Date;
}

export const archiveOldOrders = async (
  olderThanMs: number = THIRTY_DAYS_MS,
  batchSize = 500
): Promise<ArchiveResult> => {
  const cutoffDate = new Date(Date.now() - olderThanMs);
  let archivedCount = 0;

  while (true) {
    const batch = await Order.find({ created_at: { $lt: cutoffDate } })
      .limit(batchSize)
      .lean();

    if (batch.length === 0) break;

    const archiveDocs = batch.map((order) => ({
      original_order_id: order._id,
      store_id: order.store_id,
      items: order.items,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));

    let insertedDocs: Array<{ original_order_id: { toString(): string } }>;
    try {
      insertedDocs = (await OrderArchive.insertMany(archiveDocs, {
        ordered: false,
      })) as unknown as Array<{ original_order_id: { toString(): string } }>;
    } catch (err: unknown) {
      const bulkErr = err as { insertedDocs?: typeof insertedDocs };
      if (bulkErr && Array.isArray(bulkErr.insertedDocs)) {
        insertedDocs = bulkErr.insertedDocs;
      } else {
        throw err;
      }
    }

    const insertedIds = new Set(insertedDocs.map((d) => d.original_order_id.toString()));

    const idsToDelete = batch
      .filter((o) => insertedIds.has(o._id.toString()))
      .map((o) => o._id);

    if (idsToDelete.length > 0) {
      await Order.deleteMany({ _id: { $in: idsToDelete } });
      archivedCount += idsToDelete.length;
    }

    if (batch.length < batchSize) break;
  }

  return { archived_count: archivedCount, cutoff_date: cutoffDate };
};
