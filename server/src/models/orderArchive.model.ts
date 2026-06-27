import { Schema, model, Document, Types } from "mongoose";
import { OrderStatus, ORDER_STATUSES } from "../types/order.types";
import { OrderItemDoc } from "./order.model";

export interface OrderArchiveDoc extends Document {
  _id: Types.ObjectId;
  original_order_id: Types.ObjectId;
  store_id: string;
  items: OrderItemDoc[];
  total_amount: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
  archived_at: Date;
}

const OrderItemSchema = new Schema<OrderItemDoc>(
  {
    item_id: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderArchiveSchema = new Schema<OrderArchiveDoc>(
  {
    original_order_id: { type: Schema.Types.ObjectId, required: true, unique: true, index: true },
    store_id: { type: String, required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    total_amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, required: true },
    created_at: { type: Date, required: true, index: true },
    updated_at: { type: Date, required: true },
    archived_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

OrderArchiveSchema.index({ store_id: 1, created_at: -1 });

export const OrderArchive = model<OrderArchiveDoc>("OrderArchive", OrderArchiveSchema);
