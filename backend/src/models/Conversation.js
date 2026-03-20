import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversacion: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    remitente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contenido: { type: String, required: true, trim: true, maxlength: 2000 },
    leido: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) { ret.id = ret._id; delete ret._id; delete ret.__v; return ret; },
    },
  }
);

export const Message = mongoose.model("Message", messageSchema);

const conversationSchema = new mongoose.Schema(
  {
    participantes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: { validator: (arr) => arr.length === 2, message: "Debe tener 2 participantes" },
    },
    ultimoMensaje: { type: String, default: "", maxlength: 200 },
    ultimaFecha: { type: Date, default: null },
    noLeidos: { type: Map, of: Number, default: {} },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) { ret.id = ret._id; delete ret._id; delete ret.__v; return ret; },
    },
  }
);

conversationSchema.index({ participantes: 1 });
export const Conversation = mongoose.model("Conversation", conversationSchema);