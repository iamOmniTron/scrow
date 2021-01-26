import {
  TWILIO_ACCOUNT_SID as clientId,
  TWILIO_AUTH_TOKEN as authToken,
  TWILIO_NUMBER as twilioNumber,
} from "../config/config";
import { InternalError } from "./ApiError";
const client = require("twilio")(clientId, authToken);
export default class Sms {
  static async send(phoneNumber: string, smsToken: number): Promise<boolean> {
    try {
      const isSent = await client.messages.create({
        body: `Your scrow verification number : ${smsToken}`,
        from: twilioNumber,
        to: phoneNumber,
      });
      if (!isSent) return false;
      return true;
    } catch (error) {
      return false;
    }
  }
}
