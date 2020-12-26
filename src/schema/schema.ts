import { gql } from "apollo-server-express";
import { IResolvers } from "graphql-tools";
import { User as UserModel, UserDoc } from "../models/user.model";
import { hashPassword, assignToken, verifyPassword } from "../helpers/auth";
import {
  AuthError,
  InternalError,
  NotFoundError,
  ExpiredTokenError,
} from "../utils/ApiError";
import Mailer from "../utils/Mail";
import Validator from "../utils/Validator";
import { randomBytes } from "crypto";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/config";
interface IUser {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
}
export const typeDefs = gql`
  type User {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
    phone: String!
    emailToken: String!
  }
  type Query {
    users: [User!]
    user(id: ID!): User
    hello: String
  }
  type Mutation {
    signup(
      firstname: String!
      lastname: String!
      email: String!
      phone: String!
      password: String!
      password2: String!
    ): Boolean!
    login(email: String!, password: String!): User!
    confirm(token: String): Boolean!
  }
`;

export const resolvers: IResolvers = {
  Query: {
    users: async (parent, args, { req }, info): Promise<UserDoc[]> => {
      //// TODO: make auth checks
      return await UserModel.find({});
    },
    user: async (parent, args, { req }, info): Promise<UserDoc | null> => {
      //// TODO: make auth checks
      return await UserModel.findOne({ _id: args.id });
    },
    hello: (): string => `world`,
  },
  Mutation: {
    signup: async (
      parent,
      { firstname, lastname, email, phone, password, password2 },
      context,
      info
    ): Promise<boolean> => {
      try {
        const validPassword: boolean = await Validator.validatePassword(
          password
        );
        const validEmail: boolean = await Validator.validateEmail(email);
        if (!validPassword)
          throw new AuthError("password must be of valid format");
        if (!validEmail) throw new AuthError("invalid email");
        if (password !== password2) throw new AuthError("passwords must match");
        let user = await UserModel.findOne({ email: email });
        if (user) throw new AuthError("user already exist");
        const hashedPassword = await hashPassword(password, 10);
        const token: string = randomBytes(20).toString("hex");
        const oneDay: number = 86400000;
        const expirationTime: number = +(Date.now() + oneDay);
        user = new UserModel({
          firstname,
          lastname,
          email,
          phone,
          password: hashedPassword,
          emailToken: token,
          emailTokenValidity: expirationTime,
        });
        const saved = await user.save();
        if (!saved) throw new InternalError();
        await Mailer.sendConfirmationMail(email, token);
        return true;
      } catch (error) {
        throw new AuthError(error.message);
      }
    },
    login: async (
      parent,
      { email, password },
      context,
      info
    ): Promise<object> => {
      try {
        let user = await UserModel.findOne({ email });
        if (!user) throw new NotFoundError("User");
        const passwordMatched = await verifyPassword(password, user.password);
        if (!passwordMatched) throw new AuthError("Not authenticated");
        const accessToken = await assignToken(
          user._id,
          ACCESS_TOKEN_SECRET,
          "5m"
        );
        // TODO: implement refresh token
        return { accessToken: accessToken };
      } catch (error) {
        throw new AuthError(error.message);
      }
    },
    confirm: async (parent, { token }, context, info): Promise<boolean> => {
      try {
        const user: any = await UserModel.findOne({
          emailToken: token,
        });
        if (!user) throw new NotFoundError("User");
        if (user.emailTokenValidity && user.emailTokenValidity < Date.now()) {
          user.emailTokenValidity = null;
          throw new ExpiredTokenError();
        }
        user.emailTokenValidity = null;
        user.emailToken = "";
        user.confirmed = true;
        await user.save();
        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
