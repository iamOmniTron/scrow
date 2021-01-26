import {
  IContractTypeOptions,
  IDispute,
  DisputeActions,
  TransactionMessages as MESSAGE,
  TransactionStatuses as STATUS,
  ContractResponse as Response,
} from "../constants";
import ContractPartyTypes from "./contractPartyTypes";

export default class Promisee extends ContractPartyTypes {
  constructor(options: IContractTypeOptions) {
    super(options);
  }
  agree() {
    //@ts-ignore
    this.contract.agree();
  }

  settle(client: ContractPartyTypes) {
    return super.settle(client);
  }

  async fileDispute(options: IDispute) {
    return await super.fileDispute(options);
  }

  decline(): Response {
    //@ts-ignore
    if (this.contract.agreementReached) {
      return {
        status: STATUS.FAILED,
        message:
          "cannot decline contract: a contract agreement has been reached",
      };
    }
    //@ts-ignore
    this.contract.declined = true;
    return { status: STATUS.SUCCESSFUL };
    // TODO: notiffy promisor
  }
  confrimDelivery() {
    return super.confirmDelivery();
  }
}
