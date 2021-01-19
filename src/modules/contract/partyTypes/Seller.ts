import PartyTypes from "./partyTypes";
import {
  TransactionStatuses as STATUS,
  AccountInfo,
  PaymentStatuses,
} from "../constants";
import Buyer from "./Buyer";
const { PENDING, PAID } = PaymentStatuses;
const { SUCCESSFUL, FAILED } = STATUS;

export default class Seller extends PartyTypes {
  private _accountInfo!: AccountInfo;
  public paymentStatus: PaymentStatuses = PENDING;
  constructor(agreed: boolean) {
    super();
    this.agreed = agreed;
  }
  agree(): void {
    this.agreed = true;
  }
  public get accountInfo(): AccountInfo {
    return this._accountInfo;
  }
  public set accountInfo(accountDetails: AccountInfo) {
    this._accountInfo = accountDetails;
  }
  makeDelivery(client: Buyer): STATUS {
    try {
      if (!this.agreed && !client.agreed) {
        throw new Error("an agreement has to be reached");
      }

      // TODO: ALERT BUYER/CLIENT
      return SUCCESSFUL;
    } catch (error) {
      throw new Error(error.message);
      return FAILED;
    }
  }
}
