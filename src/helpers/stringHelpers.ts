// import Buyer from "../modules/contract/partyTypes/Buyer";
// import Seller from "../modules/contract/partyTypes/Seller";
import { isValidObjectId } from "mongoose";
export const dateToMilliSeconds = (date: string): number => {
  try {
    let parsedDate = Date.parse(date);
    return parsedDate;
  } catch (error) {
    throw new Error("Incorrect date format");
  }
};

export const millisecondsToDate = (milliseconds: number): string => {
  try {
    let date = new Date(milliseconds);
    return date.toString();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const isValidIdString = async (id: string): Promise<boolean> => {
  return await isValidObjectId(id);
};
// export const partyTypeFactory = (
//   type: string,
//   agreed: boolean
// ): Buyer | Seller | undefined => {
//   let partyType: Buyer | Seller | undefined;
//   switch (type) {
//     case "buyer":
//       partyType = new Buyer(agreed);
//       break;
//     case "seller":
//       partyType = new Seller(agreed);
//       break;
//     default:
//       partyType = undefined;
//       break;
//   }
//   return partyType;
// };
