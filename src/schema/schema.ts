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

interface LoginResponse {
  firstname: string;
  lastname: string;
  email: string;
  token: string;
}
export const typeDefs = gql`
  enum VerificationMethods {
    EMAIL
    PHONE
  }
  type Tokens {
    accessToken: String
    refreshToken: String
  }
  type LoginResponse {
    firstname: String!
    lastname: String!
    email: String!
    token: String!
  }
  type User {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
    phone: String!
  }
  type Query {
    users: [User!]
    user(id: ID!): User!
    hello: String!
    login(email: String!, password: String!): String!
    profile: User!
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
      try {
        const { isAuth, userId } = req;
        if (!isAuth && userId == null) throw new AuthError("unauthenticated");

        return await UserModel.find({});
      } catch (error) {
        throw new Error(error.message);
      }
    },
    user: async (parent, { id }, { req }, info): Promise<UserDoc | null> => {
      try {
        const { isAuth, userId } = req;
        if (!isAuth && userId == null) throw new AuthError("unauthenticated");

        return await UserModel.findOne({ _id: id });
      } catch (error) {
        throw new Error(error.message);
      }
    },
    hello: (): string => `world`,
    login: async (
      parent,
      { email, password },
      context,
      info
    ): Promise<LoginResponse | null> => {
      try {
        let user = await UserModel.findOne({ email });
        if (!user) throw new NotFoundError("User");
        if (!user.confirmed)
          throw new AuthError("you need to confirm your email");
        const passwordMatched = await verifyPassword(password, user.password);
        if (!passwordMatched) throw new AuthError("Not authenticated");
        const token = await assignToken(user._id, ACCESS_TOKEN_SECRET, "5m");
        return {
          firstname: user.firstname!,
          lastname: user.lastname!,
          email: user.email!,
          token: token,
        };
      } catch (error) {
        throw new AuthError(error.message);
      }
    },
    profile: async (_, __, { req }, info): Promise<UserDoc | null> => {
      const { userId, isAuth } = req;
      try {
        if (!isAuth && userId == null) {
          throw new AuthError("unauthenticated");
          return null;
        }
        const user = await UserModel.findOne({ _id: userId });
        if (!user) {
          throw new AuthError("unauthorized");
          return null;
        }
        return user;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    signup: async (
      _,
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
