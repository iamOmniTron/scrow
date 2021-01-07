import { Schema, Document, model, Types } from "mongoose";
import { User } from "./user.model";
import { Dispute, DisputeDoc } from "./dispute.model";

const ContractSchema = new Schema({
  promisor: {
    id: {
      type: Types.ObjectId,
      ref: User,
      required: true,
    },
    settled: {
      type: Boolean,
      default: false,
    },
    partyType: {
      enum: ["Buyer", "Seller"],
      required: true,
    },
    agreed: {
      type: Boolean,
      required: false,
    },
  },
  promisee: {
    id: {
      type: Types.ObjectId,
      ref: User,
      required: true,
    },
    settled: {
      type: Boolean,
      default: false,
    },
    partyType: {
      enum: ["Buyer", "Seller"],
      required: true,
    },
    agreed: {
      type: Boolean,
      required: false,
    },
  },
  deadline: {
    type: Number,
  },
  token: {
    type: Number,
    min: 6,
    max: 6,
  },
  initiatedAt: {
    type: Date,
    default: Date.now,
  },
  amountInvolved: {
    type: Types.Decimal128,
  },
  itemInvolved: {
    type: String,
  },
  disputes: {
    type: [Dispute],
  },
  agreementReached: {
    type: Boolean,
    default: false,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  declined: {
    type: Boolean,
    dafault: false,
  },
  url: {
    type: String,
  },
});

export interface IContractPartyTypes {
  id: string;
  settled: boolean;
  partyType: string;
  agreed: boolean;
}

export interface ContractDoc extends Document {
  promisor?: IContractPartyTypes;
  promisee?: IContractPartyTypes;
  deadline?: number;
  createdAt?: Date;
  amountInvolved?: number;
  itemInvolved?: string;
  dispute?: Array<DisputeDoc>;
  token?: number;
  agreementReached?: boolean;
  resolved?: boolean;
  declined?: boolean;
  url: string;
}

export const Contract = model<ContractDoc>("Contract", ContractSchema);
