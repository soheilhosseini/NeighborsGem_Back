import validator from "validator";
export const emailValidator = (email: string) => validator.isEmail(email);
export const phoneNumberValidator = (phoneNumber: string) =>
  validator.isMobilePhone(phoneNumber);
