export enum TransactionStatuses {
  SUCCESSFUL = "successfull",
  FAILED = "failed",
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

export interface IContractTypeOptions {
  id: string;
  agreed: boolean;
  type: string;
}

export enum DisputeActions {
  REFUND = "refund",
  MAKE_DELIVERY = "make delivery",
  REPORT_SCAM = "report scam",
}

export interface IDispute {
  name: string;
  claim: string;
  against: string;
  requiredAction: DisputeActions;
}

export interface IContractConstructor {
  userId: string;
  partyType: string;
  itemInvolved: string;
  amountInvolved: number;
  deadline: string;
  agreed: boolean;
}
