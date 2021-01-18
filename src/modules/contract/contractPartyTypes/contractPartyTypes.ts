import PartyTypes from "../partyTypes/partyTypes";
import Buyer from "../partyTypes/Buyer";
import Seller from "../partyTypes/Seller";
import {
  TransactionStatuses as STATUS,
  IDispute,
  IContractTypeOptions,
} from "../constants";
import Contract from "../contract";
import { Dispute } from "../../../models/dispute.model";
import Promisee from "./promisee";
import { partyTypeFactory } from "../../../helpers/stringHelpers";

const { FAILED, SUCCESSFUL } = STATUS;

export default abstract class ContractPartyTypes {
  public id: string;
  public agreed: boolean;
  public settled;
  public partyType: Buyer | Seller | undefined;
  constructor(options: IContractTypeOptions) {
    try {
      const type = options.type.toLowerCase();
      this.id = options.id;
      this.agreed = options.agreed;
      this.partyType = partyTypeFactory(type, options.agreed);
      if (this.partyType == undefined)
        throw new Error("you have to be a buyer or a seller");
      this.settled = this.partyType.settled;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  agree(): void {
    try {
      if (this.partyType == undefined) {
        throw new Error();
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  settle(client: Promisee): STATUS {
    try {
      switch (this.partyType) {
        case typeof Buyer as unknown:
          return (this.partyType as Buyer).makePayment();
          break;
        case typeof Seller as unknown:
          return (this.partyType as Seller).makeDelivery(
            client.partyType as Buyer
          );
          break;
        case undefined:
        default:
          throw new Error("you have to be a buyer or a seller");
          break;
      }
    } catch (error) {
      throw new Error(error.message);
      return FAILED;
    }
  }

  async fileDispute(options: IDispute, contract: Contract): Promise<STATUS> {
    try {
      if (!contract.agreementReached) {
        throw new Error("an agreement has to be reached");
      }
      if (Date.now() > contract.deadline) {
        throw new Error("await contact deadline before filing dispute");
      }
      const dispute = new Dispute({ ...options });
      await dispute.save();
      contract.disputes.push(dispute);
      return SUCCESSFUL;
    } catch (error) {
      throw new Error(error.message);
      return FAILED;
    }
  }
}
