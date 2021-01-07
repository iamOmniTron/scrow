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
import { InternalError, AuthError, AccessTokenError } from "./utils/ApiError";
import { verifyToken } from "./helpers/auth";
import * as jwt from "jsonwebtoken";
import logger from "morgan";
import { connect } from "mongoose";
import { ApolloServer } from "apollo-server-express";
import compression from "compression";
import { typeDefs, resolvers } from "./schema/schema";
const MONGO_URI = NODE_ENV === "development" ? MONGO_URI_PROD : MONGO_URI_DEV;
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

// const auth = (req: any, res: Response, next: NextFunction) => {
//   if (typeof req.headers.authorization !== "string") return next();
//
//   const header = req.headers.authorization!;
//   const token = header.replace("Bearer ", "");
//   try {
//     const jwtData: any = jwt.verify(token, ACCESS_TOKEN_SECRET);
//     if (jwtData && jwtData.userId!) {
//       req.userId = jwtData.userId;
//     } else {
//       throw new AuthError("User");
//     }
//   } catch (err) {
//     throw new AccessTokenError();
//   }
//   return next();
// };
// app.use(auth);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }: any) => ({ req, res }),
});
server.applyMiddleware({ app, path: "/graphql" });
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return new InternalError();
});

export default app;
