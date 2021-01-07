import { Promisor, Promisee } from "./contractPartyTypes";
import { Buyer, Seller } from "./partyTypes";
import {
  Contract as ContractModel,
  ContractDoc,
} from "../../models/contract.model";
import { Dispute, DisputeDoc } from "../../models/dispute.model";
import {
  dateToMilliSeconds,
  millisecondsToDate,
} from "../../helpers/stringHelpers";
export interface IContractConstructor {
  userId: string;
  partyType: string;
  itemInvolved: string;
  amountInvolved: number;
  deadline: string;
  agreed: boolean;
}
// export interface IContract{
//   promisor:IContractPartyTypes;
//   promisee:
// }
export class Contract {
  public contractId: string;
  public promisor: Promisor; //add promisee
  public promisee!: Promisee;
  public deadline: number;
  public createdAt: number;
  public disputes: Array<DisputeDoc> = [];
  public readonly refUrl: string;
  public itemInvolved: string;
  public amountInvolved: number;
  public declined: boolean = false;
  public agreementReached = false; //if both party's agreed
  public refToken: number = Math.floor(100000 + Math.random() * 900000);
  public resolved: boolean = false; //if both parties are settled
  constructor(options: IContractConstructor) {
    this.promisor = new Promisor(
      options.userId,
      options.agreed,
      options.partyType
    );
    this.createdAt = Date.now();
    this.deadline = dateToMilliSeconds(options.deadline);
    this.itemInvolved = options.itemInvolved;
    this.amountInvolved = options.amountInvolved;
    const contract = new ContractModel({
      promisor: {
        id: this.promisor.id,
        settled: false,
        partyType:
          typeof this.promisor.partyType == typeof Buyer ? "Buyer" : "Seller",
        agreed: this.promisor.agreed,
      },
      deadline: this.deadline,
      amountInvolved: this.amountInvolved,
      itemInvolved: this.itemInvolved,
      token: this.refToken,
    });
    //init contract url here and append contract.id to it
    this.contractId = contract._id;
    this.refUrl = `www.scrow.com/contract/${contract._id}`;
    contract.url = this.refUrl;
  }
  // public get agreementReached(): boolean {
  //   return this._agreementReached;
  // }
  // public set agreementReached() {
  //   if (this.promisor.agreed && this.promisee.agreed) {
  //     this._agreementReached = true;
  //   }
  // }
  public async registerPromisee(userId: string, agreed: boolean, type: string) {
    try {
      const promisee = new Promisee(userId, agreed, type);
      this.promisee = promisee;
      this.agreementReached =
        this.promisor.agreed && this.promisee.agreed ? true : false;
      const contract: ContractDoc | null = await ContractModel.findOne({
        _id: this.contractId,
      });
      if (!contract || contract == null) throw new Error("Invalid contract id");
      contract.promisee!.id = this.promisee.id;
      contract.promisee!.settled = false;
      contract.promisee!.partyType =
        typeof this.promisee.partyType == typeof Buyer ? "Buyer" : "Seller";
      contract.promisee!.agreed = this.promisee.agreed;
      contract.agreementReached = this.agreementReached;
      await contract.save();
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
