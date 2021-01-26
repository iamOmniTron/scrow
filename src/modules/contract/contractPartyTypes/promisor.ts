import ContractPartyTypes from "./contractPartyTypes";
import { IContractTypeOptions, IDispute } from "../constants";
import Contract from "../contract";

export default class Promisor extends ContractPartyTypes {
  constructor(options: IContractTypeOptions) {
    super(options);
  }
  settle(client: ContractPartyTypes) {
    return super.settle(client);
  }
  agree() {
    this.agreed = true;
    super.agree();
    //@ts-ignore
    if (this.contract.promisee.agreed) {
      //@ts-ignore
      this.contract.agreementReached = true;
    }
  }
  fileDispute(options: IDispute) {
    return super.fileDispute(options);
  }
}
