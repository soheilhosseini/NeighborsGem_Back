import dotenv from "dotenv";
require("dotenv").config();

export const ifInProduction = () => process.env.NODE_ENV === "production";

export const sameSite = () => (ifInProduction() ? "strict" : "none");
