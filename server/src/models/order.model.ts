import { Schema, model, Document, Types } from "mongoose";
import { OrderStatus, ORDER_STATUSES } from "../types/order.types";

export interface OrderItemDoc {
  item_id: string;
  name: string;
  qty: number;
  price: number;
}

export interface OrderDoc extends Document {
  _id: Types.ObjectId;
  store_id: string;
  items: OrderItemDoc[];
  total_amount: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
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

const OrderSchema = new Schema<OrderDoc>(
  {
    store_id: { type: String, required: true, index: true },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: OrderItemDoc[]) => Array.isArray(v) && v.length > 0,
        message: "Order must contain at least one item",
      },
    },
    total_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PLACED",
      index: true,
    },
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

OrderSchema.index({ store_id: 1, created_at: -1 });

OrderSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

export const Order = model<OrderDoc>("Order", OrderSchema);
