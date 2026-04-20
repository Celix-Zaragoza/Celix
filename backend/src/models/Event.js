import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // ID numérico del dataset de Zaragoza — evita duplicados en reimportaciones
    externalId: {
      type: Number,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
    // Tipo de actividad tal como viene del dataset
    tipo: {
      type: String,
      trim: true,
      default: "General",
    },
    // Deporte inferido (se mapea en el servicio de importación)
    deporte: {
      type: String,
      trim: true,
      default: "General",
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    // Dirección de texto
    ubicacion: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    // Coordenadas ya convertidas a WGS84 (lat/lng)
    coordenadas: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    imagen: {
      type: String,
      trim: true,
      default: "",
    },
    // URL de inscripción oficial
    registrationUrl: {
      type: String,
      trim: true,
      default: null,
    },
    // URL canónica del evento en zaragoza.es
    urlFuente: {
      type: String,
      trim: true,
      default: "",
    },
    organizer: {
      type: String,
      trim: true,
      default: "",
    },
    gratuita: {
      type: Boolean,
      default: false,
    },
    // Moderación admin (RF-39)
    oculto: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Usuarios que marcaron "interesado" (RF-23)
    interesados: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

eventSchema.virtual("numInteresados").get(function () {
  return this.interesados?.length ?? 0;
});

eventSchema.index({ startDate: 1 });
eventSchema.index({ deporte: 1 });
eventSchema.index({ oculto: 1, startDate: 1 });

export const Event = mongoose.model("Event", eventSchema);