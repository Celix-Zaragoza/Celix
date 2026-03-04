import { notImplemented } from "./_helpers.js";

export const getMe = async (req, res) => {
  return notImplemented(res, "get profile", null);
};

export const updateMe = async (req, res) => {
  return notImplemented(res, "update profile", {
    nombre: "string",
    alias: "string",
    bio: "string",
    edad: "number",
    zona: "string",
    deportes: ["string"],
    nivelGeneral: "number(0-100)",
  });
};