import * as Joi from "joi";

export default class Validator {
  static schema = Joi.object({
    name: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    repeat_password: Joi.ref("password"),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });

  static async validateName(name: string): Promise<boolean> {
    try {
      const isValid = await this.schema.validate({ name: name });
      if (!isValid) throw new Error("Name must have atleast 3 characters");
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  static async validatePassword(password: string): Promise<boolean> {
    try {
      const isValid = await this.schema.validate({ password: password });
      if (!isValid) throw new Error("Password must have a valid format");
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  static async validateEmail(email: string): Promise<boolean> {
    try {
      const isValid = await this.schema.validate({ email: email });
      if (!isValid) throw new Error("Invalid email");
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
