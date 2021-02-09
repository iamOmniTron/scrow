import { NotificationInstance } from "twilio/lib/rest/api/v2010/account/call/notification";
import {Notification,INotifDoc} from "../../models/notification.model";
import {PriorityLevel,Location} from "./constants";

export const notificationFactory=async (info:string,location:string,priorityLevel:number|string):Promise<INotifDoc>=>{
    try {
        switch (location) {
            case "profile":
                location =Location.PROFILE;
                break;
            case "account":
                location= Location.ACCOUNT;
                break;
            case "contract":
                location = Location.CONTRACT;
            default:
                throw new Error('undefined notification location')
                break;
        }

        switch (priorityLevel) {
            case 1:
                priorityLevel = PriorityLevel.NORMAL;
                break;
            case 2:
                priorityLevel = PriorityLevel.PUSH;
                break;
            case 3:
                priorityLevel = PriorityLevel.MAIL;
                break;
            default:
                throw new Error('unspcified priority level')
                break;
        }
        return await new Notification({
            info,link:`www.scrow.com/${location}`,priorityLevel
        }).save()
    }catch (error) {
        throw new Error(error.message)
    }
}