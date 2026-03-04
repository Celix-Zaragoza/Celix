import { notImplemented } from "./_helpers.js";

export const login = async (req, res) => {
  return notImplemented(res, "login", {
    email: "string",
    password: "string",
  });
};

export const register = async (req, res) => {
  return notImplemented(res, "register", {
    nombre: "string",
    email: "string",
    password: "string",
    alias: "string",
    edad: "number",
    zona: "string",
    deportes: ["string"],
    nivelGeneral: "number(0-100)",
  });
};