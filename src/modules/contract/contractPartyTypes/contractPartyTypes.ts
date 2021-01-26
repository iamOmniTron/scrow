import {
  IContractPartyTypes,
  IContractTypeOptions,
  TransactionStatuses as STATUS,
  IDispute,
  ContractResponse as Response,
  TransactionMessages as MESSAGE,
} from "../constants";
import Buyer from "../partyTypes/buyer";
import Seller from "../partyTypes/seller";
import { isValidIdString } from "../../../helpers/stringHelpers";
import { Dispute, DisputeDoc } from "../../../models/dispute.model";
import Contract from "../contract";

export default abstract class ContractPartyTypes
  implements IContractPartyTypes {
  public id: string;
  public partyType: Seller | Buyer;
  public agreed: boolean;
  public settled!: boolean;
  public _contract!: Contract;
  constructor(options: IContractTypeOptions) {
    let { id, type } = options;
    try {
      if (!isValidIdString(id)) {
        throw new Error("invalid user id");
      }
      [this.id, this.partyType] = [id, type];
      this.agreed = this.partyType.agreed;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  public get contract(): Contract {
    return this._contract;
  }
  public set contract(contract: Contract) {
    this._contract = contract;
  }
  settle(client: ContractPartyTypes): Response {
    try {
      if (!this._contract)
        return { status: STATUS.FAILED, message: MESSAGE.INVALID_CONTRACT };

      if (this.partyType instanceof Buyer) {
        return (this.partyType as Buyer).makePayment(client);
      } else if (this.partyType instanceof Seller) {
        return (this.partyType as Seller).makeDelivery(client);
      } else {
        throw "party type is undefined";
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
  agree() {
    this.partyType.agree();
  }
  async fileDispute(options: IDispute): Promise<Response> {
    //@ts-ignore
    return await this._contract.fileDispute(options);
  }
  confirmDelivery(): Response {
    if (!this._contract)
      return { status: STATUS.FAILED, message: MESSAGE.INVALID_CONTRACT };
    if (!(this.partyType instanceof Buyer)) {
      return { status: STATUS.FAILED, message: "action is for type buyer" };
    }
    return this.partyType.confirmDelivery(this._contract);
  }
}

// TODO: add the below factory method before making a contractPartyType
// function partyTypeFactory(type:string,agreed){
//   let partyType:Buyer|Seller
//   switch (type) {
//     case 'string':
//       partyType = new stringType(agreed)
//       break;
//     default:
//       break;
//   }
//   return partyType
// }
// const type = partyTypeFactory(buyer,detailsObjext)
// new Promisor|Promisee(agreed,type,)

// enum contractActions{
//   PAY_SELLER,
//   MAKE_DELIVERY
// }
//
// contract.updatePaymentStatus()=> contract.paid = true;
// contract.updateDelivery()=> contract.itemDelivered = true;
