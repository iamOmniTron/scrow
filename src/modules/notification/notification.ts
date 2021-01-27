import * as Pusher from "pusher"
import {Events} from "./constants";
import {Request} from "express";
import {PUSHER_APP_ID,PUSHER_APP_KEY,PUSHER_SECRET,PUSHER_CLUSTER} from "../../config/config";

const pusher = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_APP_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER
})
export default class Notifier{
    static async sendNotification(event:Events,payload:any,exclude?:string){
        try {
            // if(exclude){
            //     pusher.trigger("notification",event,payload,req.headers['exclude'])
            // }
            //TODO:fix this
            pusher.trigger('notification',event,payload)
        } catch (error) {
            throw new Error(error.message)
        }
    }
}