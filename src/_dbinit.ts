import { connection, Mongoose } from "mongoose";
import { connect } from "mongoose";
import { MONGO_URI_DEV, MONGO_URI_PROD, NODE_ENV } from "./config/config";

module.exports = function () {
  const MONGO_URI = NODE_ENV === "production" ? MONGO_URI_PROD : MONGO_URI_DEV;
  connect(MONGO_URI, {
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    keepAlive: true,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};
