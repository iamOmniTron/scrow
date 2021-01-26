import {
  TransactionStatuses as STATUS,
  ContractResponse as Response,
  TransactionMessages as MESSAGE,
  IDispute,
} from "./constants";
import { ContractDoc } from "../../models/contract.model";
import { Dispute, DisputeDoc } from "../../models/dispute.model";
import ContractPartyTypes from "./contractPartyTypes/contractPartyTypes";

export default class Contract {
  public agree(this: ContractDoc): void {
    if (this.promisor && this.promisee) {
      while (!this.declined) {
        this.promisee.agreed = true;
        this.promisee.partyType!.agreed = true;
        if (this.promisor.agreed) this.agreementReached = true;
      }
    }
  }
  public pay(this: ContractDoc, client: ContractPartyTypes): Response {
    try {
      if (!this.promisor && !this.promisee)
        return {
          status: STATUS.FAILED,
          message: MESSAGE.INVALID_CONTRACT_TYPES,
        };

      if (this.declined)
        return { status: STATUS.FAILED, message: MESSAGE.DECLINED };

      if (!this.agreementReached)
        return {
          status: STATUS.FAILED,
          message: MESSAGE.NOT_AGREED,
        };

      if (this.paid)
        return {
          status: STATUS.FAILED,
          message: `payment of NGN${this.amountInvolved} made already`,
        };

      // TODO: do payment logic here to pay contract.amountInvolved and notify
      //assume everything went well
      this.paid = true;
      client.settled = true;
      if (this.delivered && this.promisor!.settled && this.promisee!.settled)
        this.resolved = true;
      // TODO: wait and send money to the seller

      return {
        status: STATUS.SUCCESSFUL,
        message: MESSAGE.RESOLVED,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
  public makeDelivery(this: ContractDoc, client: ContractPartyTypes): Response {
    if (!this.promisor && !this.promisee)
      return { status: STATUS.FAILED, message: MESSAGE.INVALID_CONTRACT_TYPES };

    if (this.declined)
      return { status: STATUS.FAILED, message: MESSAGE.DECLINED };

    if (!this.agreementReached)
      return { status: STATUS.FAILED, message: MESSAGE.NOT_AGREED };

    // TODO: notification
    client.settled = true;
    return { status: STATUS.SUCCESSFUL };
  }

  public confirmDelivery(this: ContractDoc): Response {
    if (!this.promisor && !this.promisee)
      return { status: STATUS.FAILED, message: MESSAGE.INVALID_CONTRACT_TYPES };
    if (this.declined)
      return { status: STATUS.FAILED, message: MESSAGE.DECLINED };
    if (!this.agreementReached)
      return { status: STATUS.FAILED, message: MESSAGE.NOT_AGREED };

    this.delivered = true;
    if (this.paid && this.promisor!.settled && this.promisee!.settled) {
      this.resolved = true;
      return { status: STATUS.SUCCESSFUL, message: MESSAGE.RESOLVED };
    }
    return { status: STATUS.SUCCESSFUL };
  }

  async fileDispute(this: ContractDoc, options: IDispute): Promise<Response> {
    try {
      if (!this.promisor && !this.promisee)
        return {
          status: STATUS.FAILED,
          message: MESSAGE.INVALID_CONTRACT_TYPES,
        };
      if (!options) {
        throw new Error(
          "options :complainant,claim,against and required action missing"
        );
      }
      const { complainant, claim, against, requiredAction } = options;
      if (this.declined)
        return { status: STATUS.FAILED, message: MESSAGE.DECLINED };
      // NOTE: MAKE SURE {AMOUNT,ITEM_INVOLVED,DEADLINE} ARE ALL SET UPON CONTRACT INITIALIZATION
      if (!this.deadline || this.deadline == undefined) {
        return { status: STATUS.FAILED, message: MESSAGE.INVALID_CONTRACT };
      }
      if (this.deadline > Date.now()) {
        return {
          status: STATUS.FAILED,
          message: "please await deadline before filing disputes",
        };
      }
      const dispute: DisputeDoc = new Dispute({
        complainant: complainant.id,
        against: against.id,
        claim,
        requiredAction,
      });
      const isSaved = await dispute.save();
      if (!isSaved) {
        throw new Error("unable file dispute");
      }
      return { status: STATUS.SUCCESSFUL };
      // TODO: notify ${against}
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
