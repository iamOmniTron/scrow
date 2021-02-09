import PartyTypes from "./partyTypes";
import { AccountInfo, TransactionStatuses as STATUS } from "../constants";
import ContractPartyTypes from "../contractPartyTypes/contractPartyTypes";
import { ContractDoc } from "../../../models/contract.model";

export default class Buyer extends PartyTypes {
  constructor(agreed: boolean) {
    super(agreed);
    this.agreed = agreed;
  }
  agree() {
    super.agreed = true;
  }

  confirmDelivery(contract: ContractDoc) {
    //@ts-ignore
    return contract.confirmDelivery();
  }
  makePayment(client: ContractPartyTypes) {
    //@ts-ignore
    return client.contract.pay(client);
    // TODO: add payment functionality
  }
}
