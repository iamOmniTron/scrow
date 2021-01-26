import Seller from "./partyTypes/seller";
import Buyer from "./partyTypes/buyer";
import { ContractDoc } from "../../models/contract.model";
import ContractPartyTypes from "./contractPartyTypes/contractPartyTypes";

export enum TransactionStatuses {
  SUCCESSFUL = "successfull",
  FAILED = "failed",
}
export enum TransactionMessages {
  DECLINED = "contract was declined",
  NOT_AGREED = "a contract agreement must be reached",
  RESOLVED = "contract resolved successfully",
  INVALID_CONTRACT = "invalid contract",
  INVALID_CONTRACT_TYPES = "contract requires a promisor and a promisee",
}
export interface ContractResponse {
  status: TransactionStatuses;
  message?: TransactionMessages | string;
}

export enum PaymentStatuses {
  PENDING = "pending",
  PAID = "paid",
}

export interface AccountInfo {
  accountNumber: number;
  accountName: string;
  accountBank: string;
}

export enum DisputeActions {
  REFUND = "refund",
  MAKE_DELIVERY = "make delivery",
  MAKE_PAYMENT = "make payment",
  REPORT_SCAM = "report scam",
}

export interface IDispute {
  complainant: ContractPartyTypes;
  against: ContractPartyTypes;
  claim: string;
  requiredAction: DisputeActions;
}
export interface IContractTypeOptions {
  id: string;
  type: Buyer | Seller;
}

export interface IPartyTypes {
  agreed: boolean;
  agree(): void;
}

export interface IContractPartyTypes {
  id: string;
  agreed: boolean;
  settled: boolean;
  settle(client: ContractPartyTypes): ContractResponse;
  partyType: IPartyTypes;
  contract: any;
}
