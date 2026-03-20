import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

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

userSchema.virtual("numSeguidores").get(function () { return this.seguidores?.length ?? 0; });
userSchema.virtual("numSiguiendo").get(function () { return this.siguiendo?.length ?? 0; });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidate) {
  try {
    return await bcrypt.compare(candidate, this.password);
  } catch {
    return false;
  }
};

userSchema.index({ alias: "text", nombre: "text" });

export const User = mongoose.model("User", userSchema);