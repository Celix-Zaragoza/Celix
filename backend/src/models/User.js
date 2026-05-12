/**
 * @file User.js
 * @description Modelo de usuario. Define el esquema de Mongoose con los datos
 * del perfil, relaciones sociales, control de acceso y métodos de autenticación.
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Subschema que representa un deporte practicado por el usuario y su nivel asociado.
 */
const deporteNivelSchema = new mongoose.Schema(
  {
    deporte: { type: String, required: true, trim: true },
    nivel: { type: Number, min: 1, max: 5, default: 1 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String, required: true, unique: true, trim: true, lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email inválido"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    alias: {
      type: String, required: true, unique: true, trim: true,
      minlength: 3, maxlength: 40,
      match: [/^[a-zA-Z0-9_]+$/, "El alias solo permite letras, números y guion bajo"],
    },
    edad: { type: Number, min: 13, max: 120 },
    zona: { type: String, trim: true, maxlength: 120 },
    // Deportes con nivel por cada uno (escala 1-5)
    deportesNivel: { type: [deporteNivelSchema], default: [] },
    avatar: { type: String, trim: true, default: "" },
    // Relaciones sociales
    siguiendo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    seguidores: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Eventos guardados (RF-23)
    eventosGuardados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    // Control de acceso
    rol: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    bloqueado: { type: Boolean, default: false },
    // Onboarding completo
    perfilCompleto: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Virtuals para obtener el número de seguidores y seguidos sin almacenarlos en BD
userSchema.virtual("numSeguidores").get(function () { return this.seguidores?.length ?? 0; });
userSchema.virtual("numSiguiendo").get(function () { return this.siguiendo?.length ?? 0; });

/**
 * Hook pre-save que hashea la contraseña antes de guardarla si ha sido modificada.
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compara una contraseña en texto plano con el hash almacenado.
 * @param {string} candidate - Contraseña en texto plano a verificar.
 * @returns {Promise<boolean>} true si la contraseña es correcta, false en caso contrario.
 */
userSchema.methods.comparePassword = async function (candidate) {
  try {
    return await bcrypt.compare(candidate, this.password);
  } catch {
    return false;
  }
};

// Índice de texto para búsqueda por alias y nombre
userSchema.index({ alias: "text", nombre: "text" });

export const User = mongoose.model("User", userSchema);