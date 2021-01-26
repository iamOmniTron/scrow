import { IPartyTypes } from "../constants";

export default abstract class PartyTypes implements IPartyTypes {
  constructor(public agreed: boolean) {}
  agree() {
    this.agreed = true;
  }
}
