import { Document, Schema, model } from "mongoose";

const DisputeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  against: {
    type: String,
    required: true,
  },
  claim: {
    type: String,
    min: 20,
    required: true,
  },
  actionRequired: {
    type: String,
    enum: ["refund", "make delivery", "report scam"],
    required: true,
  },
});

export interface DisputeDoc extends Document {
  name: string;
  against: string;
  claim: string;
  actionRequired: string;
}

export const Dispute = model<DisputeDoc>("Dispute", DisputeSchema);
