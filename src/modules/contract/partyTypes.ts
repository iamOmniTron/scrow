// abstract class PartyType {
//   constructor(agreed: boolean) {}
//   abstract settled: boolean;
//   abstract settle(): boolean;
//   abstract fileDispute(): boolean;
// }
//
// export class Seller extends PartyType {
//   constructor(agreed: boolean) {
//     super(agreed);
//     this.agreed = agreed;
//     super.settled = false;
//   }
//   settle(party: Buyer): boolean {
//     // TODO: make delivery here
//     return (party.settled = true);
//   }
//   fileDispute(disputeOptions: any): bolean {
//     return true;
//   }
// }
//
// export class Buyer extends PartyType {
//   constructor(agreed: boolean) {
//     super(agreed, settled);
//     this.agreed = agreed;
//     this.settled = false;
//   }
//   settle(party: Seller): boolean {
//     // TODO: add payment method
//     return (party.settled = true);
//   }
//   fileDispute(disputeOptions: any): boolean {
//     return true;
//   }
// }
