import { notImplemented } from "./_helpers.js";

export const listPosts = async (req, res) => {
  return notImplemented(res, "list posts", null);
};

export const createPost = async (req, res) => {
  return notImplemented(res, "create post", {
    deporte: "string",
    ubicacion: "string",
    contenido: "string",
    image: "file | optional",
  });
};