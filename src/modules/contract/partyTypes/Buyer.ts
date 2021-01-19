import PartyTypes from "./partyTypes";
import { TransactionStatuses as STATUS } from "../constants";
import Contract from "../contract";
const { SUCCESSFUL, FAILED } = STATUS;

export default class Buyer extends PartyTypes {
  constructor(agreed: boolean) {
    super();
    this.agreed = agreed;
  }
  agree() {
    this.agreed = true;
  }

  confirmDelivery(contract: Contract): boolean {
    try {
      if (!contract.agreementReached) {
        throw new Error("agreement must be reached to confirm delivery");
        return false;
      }
      this.settled = true;

      return true;
    } catch (error) {
      throw new Error(error.message);
      return false;
    }
  }

  makePayment(): STATUS {
    // TODO: add a payment helper and integrate & settle buyer
    return FAILED;
  }
}
