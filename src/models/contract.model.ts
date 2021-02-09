import { Schema, Document, model, Types } from "mongoose";
import { User } from "./user.model";
import { DisputeDoc } from "./dispute.model";
const Dispute = require("./dispute.model").schema;
import Contract from "../modules/contract/contract";
import { AccountInfo } from "../modules/contract/constants";

const ContractSchema = new Schema({
  promisor: {
    id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    settled: {
      type: Boolean,
      default: false,
    },
    partyType: {
      agreed: Boolean,
      settled: Boolean,
      accountInfo: {
        accountName: String,
        accountInfo: String,
        accountBank: String,
      },
    },
    agreed: {
      type: Boolean,
      required: false,
    },
  },
  promisee: {
    id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    settled: {
      type: Boolean,
      default: false,
    },
    partyType: {
      agreed: Boolean,
      settled: Boolean,
      accountInfo: {
        accountName: String,
        accountInfo: String,
        accountBank: String,
      },
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
  paid: {
    type: Boolean,
    default: false,
  },
  delivered: {
    type: Boolean,
    default: false,
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
  ended: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
  },
});

export interface PartyTypes {
  agreed: boolean;
  settled: boolean;
  accountInfo?: AccountInfo;
}

export interface IContractPartyTypes {
  id?: string;
  settled: boolean;
  partyType?: PartyTypes;
  agreed: boolean;
}

export interface ContractDoc extends Document {
  promisor?: IContractPartyTypes;
  promisee?: IContractPartyTypes;
  deadline?: number;
  createdAt?: Date;
  paid?: boolean;
  delivered?: boolean;
  amountInvolved?: number;
  itemInvolved?: string;
  disputes?: Array<DisputeDoc>;
  token?: number;
  agreementReached?: boolean;
  resolved?: boolean;
  declined?: boolean;
  ended?: boolean;
  url?: string;
}
ContractSchema.loadClass(Contract);

export const ContractModel = model<ContractDoc>(
  "ContractModel",
  ContractSchema
);
