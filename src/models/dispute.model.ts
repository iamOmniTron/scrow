import { Document, Schema, model, Types } from "mongoose";
import { User } from "./user.model";

const DisputeSchema = new Schema({
  complainant: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  against: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  claim: {
    type: String,
    min: 20,
    required: true,
  },
  requiredAction: {
    type: String,
    // enum: ["refund", "make delivery", "report scam"],
    required: true,
  },
});

export interface DisputeDoc extends Document {
  complainant: string;
  against: string;
  claim: string;
  requiredAction: string;
}

export const Dispute = model<DisputeDoc>("Dispute", DisputeSchema);
