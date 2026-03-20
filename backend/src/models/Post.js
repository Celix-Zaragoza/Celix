import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    autor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contenido: { type: String, required: true, trim: true, maxlength: 500 },
    imagen: { type: String, trim: true, default: null },
    tipo: { type: String, enum: ["entrenamiento", "resultado", "plan"], default: "entrenamiento" },
    deporte: { type: String, required: true, trim: true, maxlength: 80 },
    ubicacion: { type: String, trim: true, maxlength: 180, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    oculto: { type: Boolean, default: false },
    eliminado: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        ret.id = ret._id; delete ret._id; delete ret.__v; return ret;
      },
    },
  }
);

postSchema.virtual("numLikes").get(function () { return this.likes?.length ?? 0; });
postSchema.index({ autor: 1, createdAt: -1 });
postSchema.index({ deporte: 1, createdAt: -1 });
postSchema.index({ oculto: 1, eliminado: 1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);