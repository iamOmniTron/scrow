import { InternalError } from "./ApiError";
import nodemailer, { Transporter } from "nodemailer";
import {
  MAIL_SERVICE_NAME,
  GMAIL_USER_NAME,
  GMAIL_USER_PASSWORD,
} from "../config/config";

const transporter = nodemailer.createTransport({
  service: MAIL_SERVICE_NAME,
  auth: {
    user: GMAIL_USER_NAME,
    pass: GMAIL_USER_PASSWORD,
  },
});

export default class Mailer {
  static async sendConfirmationMail(
    email: string,
    token: string
  ): Promise<boolean> {
    const options = {
      from: `<no-reply>@scrow.com`,
      to: email,
      subject: `Confirm Your Email`,
      html: `<h1>Hello from scrow</h1><p>follow the link to confirm your email</p><br> <button><a href='http://www.scrow.com/confirmation/${token}'>Link</a></button>`,
      generateTextFromHtml: true,
    };
    try {
      const sent = await this.send(options);
      if (!sent) throw new InternalError();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async resendCOnfirmationMail(
    email: string,
    token: string
  ): Promise<boolean> {
    const options = {
      from: `<no-reply>@scrow.com`,
      to: email,
      subject: `Confirmation Email Resent`,
      html: `<h1>Hello from scrow</h1><p>confirm your email</p><br> <button><a href='http://www.scrow.com/confirmation/${token}'>Link</a></button>`,
      generateTextFromHtml: true,
    };
    try {
      const sent = await this.send(options);
      if (!sent) throw new InternalError();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async sendResetPasswordMail(
    email: string,
    token: string
  ): Promise<boolean> {
    const options = {
      from: `<no-reply>@scrow.com`,
      to: email,
      subject: `Reset Your Password`,
      html: `<h1>Hello from scrow</h1><p>follow the link to reset your password</p><br><button> <a href='http://www.scrow.com/password-reset/${token}'>Link</a><button>`,
      generateTextFromHtml: true,
    };
    try {
      const sent = await this.send(options);
      if (!sent) throw new InternalError();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  static async send(message: any): Promise<boolean> {
    try {
      const sent = await transporter.sendMail(message);
      if (!sent) throw new InternalError();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
