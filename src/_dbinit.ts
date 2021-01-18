import { connection, Mongoose } from "mongoose";
import {connect} from "mongoose";
import { MONGO_URI_DEV, MONGO_URI_PROD, NODE_ENV } from "./config/config";

module.exports = function(){
    const MONGO_URI = NODE_ENV === "development" ? MONGO_URI_PROD : MONGO_URI_DEV;
    const db = connect(MONGO_URI_PROD, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      });
    
      db.on('connect',()=>{
          console.log(`connected to db in ${NODE_ENV} environment...`)
      });

      db.on('error',(error:Error)=>{
        console.log(error.message);
      });

      db.on('disconnected',()=>{
          console.log(`disonnecting from db...`)
      })
}
