import { Schema, Document, model, Types } from "mongoose";
import { User, UserDoc } from "./user.model";

const ContractSchema = new Schema({
  promisor: {
    type: Types.ObjectId,
    ref: User,
  },
  promisee: {
    type: Types.ObjectId,
    ref: User,
  },
  amountInvolved: {
    type: Number,
  },
});

export default model("Contract", ContractSchema);
