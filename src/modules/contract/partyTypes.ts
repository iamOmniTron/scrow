import { Promisor, Promisee } from "./contractPartyTypes";

export abstract class PartyTypes {
  //either a seller or a Buyer must have a settle method and settle member
  protected settle(client: Promisor | Promisee): boolean {
    return false;
  }
  // public settled: boolean = false;
}

export class Seller extends PartyTypes {
  constructor(public agreed: boolean) {
    super();
  }
  settle(client: Promisor | Promisee): boolean {
    try {
      if (this.agreed !== true) {
        throw new Error(
          "you have to reach an agreement before you sell anything"
        );
        return false;
      }
      //request for account details
      client.settled = true;
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export class Buyer extends PartyTypes {
  constructor(public agreed: boolean) {
    super();
  }

  settle(client: Promisor | Promisee): boolean {
    try {
      if (this.agreed !== true) {
        throw new Error(
          "you have to reach an agreement before you buy anything"
        );
        return false;
      }
      //make payment logic here
      client.settled = true;
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
