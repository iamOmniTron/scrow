import { connection, Mongoose } from "mongoose";
import { connect } from "mongoose";
import { MONGO_URI_DEV, MONGO_URI_PROD, NODE_ENV } from "./config/config";

module.exports = function () {
  const MONGO_URI = NODE_ENV === "production" ? MONGO_URI_PROD : MONGO_URI_DEV;
  connect(MONGO_URI, {
    keepAlive: true,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }).then(() => console.log("connected to db"));
};
