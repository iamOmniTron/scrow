import { Schema, model, Document } from "mongoose";

const NotifSchema = new Schema({
  info: {
    type: String,
  },
  time: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  link: {
    type: String,
  },
  priorityLevel: {
    type: String,
    enum: ["normal", "push", "mail"],
  },
});
export interface INotifDoc extends Document {
  info: string;
  time?: string;
  link?: string;
  priorityLevel: string;
}

export const Notification = model<INotifDoc>("Notification", NotifSchema);
