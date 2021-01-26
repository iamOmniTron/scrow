import PartyTypes from "./partyTypes";
import {
  AccountInfo,
  TransactionStatuses as STATUS,
  ContractResponse as Response,
} from "../constants";
import ContractPartyType from "../contractPartyTypes/contractPartyTypes";

export default class Seller extends PartyTypes {
  private _accountDetails!: AccountInfo;
  constructor(agreed: boolean) {
    super(agreed);
    this.agreed = agreed;
  }
  public get accountDetails(): AccountInfo {
    return this._accountDetails;
  }
  public set accountDetails(info: AccountInfo) {
    this._accountDetails = info;
  }

  makeDelivery(client: ContractPartyType): Response {
    // TODO: notify buyer partyType for delivery following the mediator pattern if agreement is reached
    //@ts-ignore
    return client.contract.makeDelivery(client);
  }
  agree(): void {
    super.agreed = true;
  }
}
