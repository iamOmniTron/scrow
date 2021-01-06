import { gql } from "apollo-server-express";
import { IResolvers } from "graphql-tools";
import { User as UserModel, UserDoc } from "../models/user.model";
import {
  hashPassword,
  assignToken,
  verifyPassword,
  verifyToken,
} from "../helpers/auth";
import {
  AuthError,
  InternalError,
  NotFoundError,
  ExpiredTokenError,
} from "../utils/ApiError";
import Mailer from "../utils/Mail";
import Sms from "../utils/Sms";
import Validator from "../utils/Validator";
import { randomBytes } from "crypto";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/config";

export const typeDefs = gql`
  enum VerificationMethods {
    EMAIL
    PHONE
  }
  type Tokens {
    accessToken: String
    refreshToken: String
  }
  type User {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
    phone: String!
    emailToken: String!
    confirmed: Boolean!
    smsToken: Int!
  }
  type Query {
    users: [User!]
    user(id: ID!): User
    hello: String
    login(email: String!, password: String!): String!
  }
  type Mutation {
    signup(
      firstname: String!
      lastname: String!
      email: String!
      phone: String!
      password: String!
      password2: String!
      verificationMethod: VerificationMethods!
    ): Boolean!
    confirmEmail(token: String): Boolean!
    confirmSms(token: String): Boolean!
  }
`;

enum VerificationMethods {
  EMAIL,
  PHONE,
}
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
    login: async (
      parent,
      { email, password },
      context,
      info
    ): Promise<string> => {
      try {
        let user = await UserModel.findOne({ email });
        if (!user) throw new NotFoundError("User");
        const passwordMatched = await verifyPassword(password, user.password);
        if (!passwordMatched) throw new AuthError("Not authenticated");
        const token = await assignToken(user._id, ACCESS_TOKEN_SECRET, "5m");
        return token;
      } catch (error) {
        throw new AuthError(error.message);
      }
    },
  },

  Mutation: {
    signup: async (
      parent,
      {
        firstname,
        lastname,
        email,
        phone,
        password,
        password2,
        verificationMethod,
      },
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
        if (!verificationMethod)
          throw new Error("a verification method is required");
        let user = await UserModel.findOne({ email: email });
        if (user) throw new AuthError("user already exist");
        const hashedPassword = await hashPassword(password, 10);
        user = new UserModel({
          firstname,
          lastname,
          email,
          phone,
          password: hashedPassword,
        });
        switch (verificationMethod) {
          case "EMAIL":
            let mailToken: string = randomBytes(20).toString("hex");
            let oneDay: number = 86400000;
            let mailExpirationTime: number = +(Date.now() + oneDay);
            const isMailSent = await Mailer.sendConfirmationMail(
              user.email!,
              mailToken
            );
            if (!isMailSent) throw new Error("Mailing failed");
            (user.emailToken = mailToken),
              (user.emailTokenValidity = mailExpirationTime);
            break;
          case "PHONE":
            let smsToken = Math.floor(100000 + Math.random() * 900000);
            let smsExpirationTime = +(Date.now() + 45000); //45 seconds from now;
            const isSmsSent = await Sms.send(phone, smsToken);
            if (!isSmsSent) throw new Error("Sms failed");
            user.smsToken = smsToken;
            user.smsTokenValidity = smsExpirationTime;
            break;
          default:
            throw new Error(" default issue");
            break;
        }
        await user.save();
        return true;
      } catch (error) {
        throw new AuthError(error.message);
      }
    },
    confirmEmail: async (
      parent,
      { token },
      context,
      info
    ): Promise<boolean> => {
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
    confirmSms: async (parent, { token }, context, info): Promise<boolean> => {
      try {
        const user = await UserModel.findOne({ smsToken: token });
        if (!user) throw new NotFoundError("User");
        if (user.smsTokenValidity && user.smsTokenValidity < Date.now()) {
          throw new ExpiredTokenError();
        }
        user.smsTokenValidity = null;
        user.smsToken = null;
        user.confirmed = true;
        await user.save();
        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
