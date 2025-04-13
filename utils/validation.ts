import validator from "validator";
export const emailValidator = (email: string) => validator.isEmail(email);
export const phoneNumberValidator = (phoneNumber: string) =>
  validator.isMobilePhone(phoneNumber);

export const isValidPassword = (password: string) =>
  validator.isStrongPassword(password, {
    minLength: 3,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
