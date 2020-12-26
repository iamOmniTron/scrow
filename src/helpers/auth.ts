import { AuthError, InternalError, TokenError } from "../utils/ApiError";
import * as jwt from "jsonwebtoken";
import { hash, compare } from "bcrypt";
export interface UserId {
  userId: string;
}

export const assignToken = async (
  userId: UserId,
  secret: string,
  expiration: string
): Promise<string> => {
  try {
    const token: string = await jwt.sign({ userId }, secret, {
      expiresIn: expiration,
    });
    if (!token) {
      throw new InternalError();
    }
    return token;
  } catch (error) {
    throw new InternalError();
  }
};

export const verifyToken = async (
  token: string,
  secret: string
): Promise<any> => {
  try {
    const userId = await jwt.verify(token, secret);
    if (!userId) {
      throw new TokenError("token is invalid");
    }
    return userId;
  } catch (error) {
    throw new AuthError("failed to authenticate user!");
  }
};

export const hashPassword = async (
  password: string,
  salt: number
): Promise<string> => {
  return await hash(password, salt);
};
export const verifyPassword = async (
  input: string | undefined,
  password: string | undefined
): Promise<boolean> => {
  if (input == undefined || password == undefined) return false;
  return await compare(input, password);
};
