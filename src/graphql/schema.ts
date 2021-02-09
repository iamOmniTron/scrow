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
  TokenError,
  NotFoundError,
  ExpiredTokenError,
} from "../utils/ApiError";
import Mailer from "../utils/Mail";
import Sms from "../utils/Sms";
import Validator from "../utils/Validator";
import { randomBytes } from "crypto";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/config";

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: LoginData;
}
interface LoginData {
  firstname?: string;
  lastname?: string;
  email?: string;
  token?: string;
}
interface ApiResponse {
  success: boolean;
  data?: any;
  message?: any;
}
export const typeDefs = gql`
  type ApiResponse {
    success: Boolean!
    message: String
  }
  enum VerificationMethods {
    EMAIL
    PHONE
  }
  type Tokens {
    accessToken: String
    refreshToken: String
  }
  type LoginData {
    firstname: String!
    lastname: String!
    email: String!
    token: String!
  }

  type LoginResponse {
    sucess: Boolean!
    message: String
    data: LoginData
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
    profile: ApiResponse!
  }
  type Mutation {
    login(email: String!, password: String!): LoginResponse!
    signup(
      firstname: String!
      lastname: String!
      email: String!
      phone: String!
      password: String!
      password2: String!
      verificationMethod: VerificationMethods!
    ): ApiResponse!
    confirmEmail(token: String): ApiResponse!
    confirmSms(token: String): ApiResponse!
  }
`;

enum VerificationMethods {
  EMAIL,
  PHONE,
}
export const resolvers: IResolvers = {
  Query: {
    users: async (_, __, { req }, info): Promise<UserDoc[]> => {
      try {
        const { isAuth, userId } = req;
        if (!isAuth && userId == null) throw new AuthError("unauthenticated");

        return await UserModel.find({});
      } catch (error) {
        throw new Error(error.message);
      }
    },
    user: async (_, { id }, { req }, info): Promise<UserDoc | null> => {
      try {
        const { isAuth, userId } = req;
        if (!isAuth && userId == null) throw new AuthError("unauthenticated");

        return await UserModel.findOne({ _id: id });
      } catch (error) {
        throw new Error(error.message);
      }
    },
    hello: (): string => `world`,
    profile: async (_, __, { req }, info): Promise<ApiResponse> => {
      const { userId, isAuth } = req;
      try {
        if (!isAuth && userId == null)
          return {
            success: false,
            message: "not authenticated",
          };

        const user = await UserModel.findOne({ _id: userId });
        if (!user)
          return {
            success: false,
            message: "not authorized",
          };

        return {
          success: true,
          data: user,
        };
      } catch (error) {
        return { success: false };
      }
    },
  },

  Mutation: {
    login: async (
      _,
      { email, password },
      context,
      info
    ): Promise<LoginResponse> => {
      try {
        let user: UserDoc | null = await UserModel.findOne({ email });
        if (!user) return { success: false, message: "user not found" };
        if (user && !user.confirmed)
          return { success: false, message: "you need to confirm your email" };
        const passwordMatched = await verifyPassword(password, user.password);
        if (!passwordMatched)
          return { success: false, message: "not authenticated" };
        const token = await assignToken(user._id, ACCESS_TOKEN_SECRET, "5m");
        return {
          success: true,
          data: {
            firstname: user.firstname!,
            lastname: user.lastname!,
            email: user.email!,
            token: token,
          },
        };
      } catch (error) {
        return { success: false };
      }
    },
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
    ): Promise<ApiResponse> => {
      try {
        const validPassword: boolean = await Validator.validatePassword(
          password
        );
        const validEmail: boolean = await Validator.validateEmail(email);
        if (!validPassword)
          throw new TokenError("password must be a strong password");
        if (!validEmail)
          throw new TokenError("email must be a valid email address");
        if (password !== password2) throw new Error("passwords must match");
        if (!verificationMethod)
          throw new Error("a verification method is required");
        let user = await UserModel.findOne({ email: email });
        if (user) return { success: false, message: "user already exists" };
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
            if (!isMailSent) throw new InternalError();
            (user.emailToken = mailToken),
              (user.emailTokenValidity = mailExpirationTime);
            break;
          case "PHONE":
            let smsToken = Math.floor(100000 + Math.random() * 900000);
            let smsExpirationTime = +(Date.now() + 45000); //45 seconds from now;
            const isSmsSent = await Sms.send(phone, smsToken);
            if (!isSmsSent) throw new InternalError();
            user.smsToken = smsToken;
            user.smsTokenValidity = smsExpirationTime;
            break;
          default:
            throw new Error('a verification method is required"');
            break;
        }
        await user.save();
        return { success: true, message: "you can now confirm your account" };
      } catch (error) {
        throw new AuthError(error.message);
      }
    },
    confirmEmail: async (_, { token }, context, info): Promise<ApiResponse> => {
      try {
        const user: UserDoc | null = await UserModel.findOne({
          emailToken: token,
        });
        if (!user) return { success: false, message: "not found" };
        if (user.emailTokenValidity && user.emailTokenValidity < Date.now()) {
          user.emailTokenValidity = null;
          throw new ExpiredTokenError();
        }
        user.emailTokenValidity = null;
        user.emailToken = "";
        user.confirmed = true;
        await user.save();
        return { success: true };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    confirmSms: async (_, { token }, context, info): Promise<ApiResponse> => {
      try {
        const user: UserDoc | null = await UserModel.findOne({
          smsToken: token,
        });
        if (!user) return { success: false, message: "user not found" };
        if (user.smsTokenValidity && user.smsTokenValidity < Date.now()) {
          throw new ExpiredTokenError();
        }
        user.smsTokenValidity = null;
        user.smsToken = null;
        user.confirmed = true;
        await user.save();
        return { success: true };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
