import { PartyTypes, Seller, Buyer } from "./partyTypes";
import { DisputeDoc, Dispute } from "../../models/dispute.model";
import { Contract } from "./contract";

export const enum DisputeActions {
  REFUND,
  MAKE_DELIVERY,
  REPORT_SCAM,
}

export interface IDispute {
  name: string;
  claim: string;
  against: string;
  requiredAction: DisputeActions;
}
// TODO: add an agree method to both parties
export class Promisor {
  public settled: boolean = false;
  public partyType: Buyer | Seller;
  constructor(public id: string, public agreed: boolean, public type: string) {
    switch (type) {
      case "Buyer":
        this.partyType = new Buyer(this.agreed);
        break;
      case "Seller":
        this.partyType = new Seller(this.agreed);
        break;
      default:
        throw new Error("you have to be a buyer or a seller");
        break;
    }
  }

  public settle(client: Promisee, contract: Contract) {
    return this.partyType.settle(client);
    if (this.settled) contract.resolved = true;
  }
  public agree() {
    this.agreed = true;
  }
  // TODO: add notification and send to admin for disputes
  public async fileDispute(
    options: IDispute,
    contract: Contract
  ): Promise<DisputeDoc | null> {
    try {
      if (!contract.agreementReached) {
        throw new Error("an agreement must be reached first");
        return null;
      }
      if (Date.now() < contract.deadline) {
        throw new Error("await contract deadline filing dispute");
        return null;
      }
      const dispute = new Dispute({
        name: options.name,
        claim: options.claim,
        against: options.against,
        requiredAction: options.requiredAction,
      });
      await dispute.save();
      contract.disputes.push(dispute);
      return dispute;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export class Promisee {
  public settled: boolean = false;
  public partyType: Buyer | Seller;

  constructor(public id: string, public agreed: boolean, public type: string) {
    switch (type) {
      case "Buyer":
        this.partyType = new Buyer(this.agreed);
        break;
      case "Seller":
        this.partyType = new Seller(this.agreed);
        break;
      default:
        throw new Error("you have to be a buyer or a seller");
        break;
    }
  }
  public settle(client: Promisor) {
    return this.partyType.settle(client);
  }

  public async fileDispute(
    options: IDispute,
    contract: Contract
  ): Promise<DisputeDoc | null> {
    try {
      // only file dispute if contact agreemenmt is reached and deadline is exceeded
      if (!contract.agreementReached) {
        throw new Error("an agreement must be reached first");
        return null;
      }
      if (Date.now() < contract.deadline) {
        throw new Error("await contact deadline before filing dispute");
        return null;
      }
      const dispute = new Dispute({
        name: options.name,
        claim: options.claim,
        against: options.against,
        requiredAction: options.requiredAction,
      });
      await dispute.save();
      contract.disputes.push(dispute);
      // TODO: add functionality to the dispute class [delete,edit,prioritize]
      return dispute;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public decline(contract: Contract): boolean {
    try {
      if (contract.agreementReached) {
        throw new Error("you already signed an agreement to this contract");
        return false;
      }
      contract.declined = true;
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
