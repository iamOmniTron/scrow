import ContractPartyTypes from "./contractPartyTypes";
import {
  TransactionStatuses as STATUS,
  IDispute,
  IContractTypeOptions,
} from "../constants";
import Contract from "../contract";
import Promisee from "./promisee";

declare const options: IContractTypeOptions;

export default class Promisor extends ContractPartyTypes {
  constructor() {
    super(options);
  }

  agree(): void {
    return this.partyType.agree();
  }

  settle(client: Promisee) {
    return super.settle(client);
  }

  fileDispute(options: IDispute, contract: Contract) {
    return super.fileDispute(options, contract);
  }
}
