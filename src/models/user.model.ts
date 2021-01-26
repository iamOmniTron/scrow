import { Schema, model, Document, Types } from "mongoose";
import { Notification, INotifDoc } from "./notification.model";

const UserSchema = new Schema({
  firstname: {
    type: String,
    min: 4,
  },
  lastname: {
    type: String,
    min: 4,
  },
  email: {
    type: String,
    min: 10,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    min: 10,
  },
  googleId: {
    type: String,
    unique: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  emailToken: {
    type: String,
  },
  smsToken: {
    type: Number,
  },
  smsTokenValidity: {
    type: Number,
  },
  emailTokenValidity: {
    type: Number,
  },
  identityConfirmation: {
    imageId: String,
    imageUrl: String,
    submitted: Boolean,
    isIdConfirmed: Boolean,
  },
  notifications: {
    type: Types.ObjectId,
    ref: "Notification",
  },
});
interface IdConfirmation {
  imageId: string;
  imageUrl: string;
  isIdConfirmed: Boolean;
  submitted: Boolean;
}
export interface UserDoc extends Document {
  firstname?: string;
  lastname?: string;
  password?: string;
  email?: string;
  emailToken?: string;
  emailTokenValidity?: number | null;
  smsToken?: number | null;
  smsTokenValidity?: number | null;
  googleId?: string;
  phone?: number;
  confirmed?: boolean;
  identityConfirmation?: IdConfirmation;
  notification?: INotifDoc;
}
export const User = model<UserDoc>("User", UserSchema);
