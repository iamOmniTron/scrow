import { IContractTypeOptions } from "../constants";
import ContractPartyTypes from "./contractPartyTypes";
import Contract from "../contract";

declare const options: IContractTypeOptions;

export default class Promisee extends ContractPartyTypes {
  constructor() {
    module;
    super(options);
  }

  agree(): void {
    this.partyType.agree();
  }

  settle(client: Promisee) {
    return super.settle(client);
  }
  reject(contract: Contract): boolean {
    try {
      if (contract.agreementReached) {
        throw new Error("cannot reject contract: agreement reached");
        return false;
      }
      contract.declined = true;
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
