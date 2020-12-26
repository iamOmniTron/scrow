import express, { Request, Response, NextFunction, Application } from "express";
import {
  MONGO_URI_DEV,
  MONGO_URI_PROD,
  NODE_ENV,
  CORS_URL,
  ACCESS_TOKEN_SECRET,
} from "./config/config";
import cors from "cors";
import { User } from "./models/user.model";
import { json, urlencoded } from "body-parser";
import { InternalError, AuthError } from "./utils/ApiError";
import { verifyToken } from "./helpers/auth";
import logger from "morgan";
import { connect } from "mongoose";
import { ApolloServer } from "apollo-server-express";
import compression from "compression";
import { typeDefs, resolvers } from "./schema/schema";

connect(MONGO_URI_PROD, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
  .then(() => console.log(`Connected to mongodb`))
  .catch((error) => {
    console.log(error.message);
  });
const app: Application = express();

app.use(compression());
app.use(cors({ origin: CORS_URL }));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(logger("dev"));
const getUser = async (token: string): Promise<string | null> => {
  try {
    if (!token) return null;
    return await verifyToken(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: (req: Request) => req,
});
server.applyMiddleware({ app, path: "/graphql" });
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return new InternalError();
});

export default app;
