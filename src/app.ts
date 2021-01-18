import express, { Request, Response, NextFunction, Application } from "express";
import {
  NODE_ENV,
  CORS_URL,
  ACCESS_TOKEN_SECRET,
} from "./config/config";
import cors from "cors";
import { User } from "./models/user.model";
import { json, urlencoded } from "body-parser";
import { InternalError, AuthError, AccessTokenError } from "./utils/ApiError";
import { verifyToken } from "./helpers/auth";
import * as jwt from "jsonwebtoken";
import logger from "morgan";
import { connect } from "mongoose";
import { ApolloServer } from "apollo-server-express";
import compression from "compression";
import { typeDefs, resolvers } from "./schema/schema";
require('./_dbinit')();
const app: Application = express();

app.use(compression());
app.use(cors({ origin: CORS_URL }));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(logger("dev"));

const auth = (req: any, res: Response, next: NextFunction) => {
  const header = req.headers.authorization!;
  if (typeof header !== "string") {
    req.isAuth = false;
    req.userId = null;
    return next();
  }
  const token = header.replace("Bearer ", "");
  if (token === "") {
    req.isAuth = false;
    req.userId = null;
    return next();
  }
  const jwtData: any = jwt.verify(token, ACCESS_TOKEN_SECRET);
  if (!jwtData && jwtData.userId) {
    req.isAuth = false;
    req.userId = null;
    return next();
  }
  req.isAuth = true;
  req.userId = jwtData.userId;
  next();
};
app.use(auth);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }: any) => ({ req }),
});
server.applyMiddleware({ app, path: "/graphql" });
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return new InternalError();
});

export default app;
