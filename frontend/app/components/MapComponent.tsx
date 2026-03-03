"use client";

import { Instalacion } from "../data/mockData";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface MapComponentProps {
  instalaciones: Instalacion[];
}

export const MapComponent = ({ instalaciones }: MapComponentProps) => {
  const center = { lat: 41.6488, lng: -0.8891 };

  // (Opcional) si algún día lo quieres usar en <img src=...>
  // const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?...`;

  return (
    <div className="space-y-4">
      <div className="relative bg-[#1e293b] rounded-xl overflow-hidden" style={{ height: "400px" }}>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-[#13ec80] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#f1f5f9] mb-2">Mapa de Instalaciones</h3>
            <p className="text-[#94a3b8] mb-4">
              Vista de {instalaciones.length} instalaciones deportivas en Zaragoza
            </p>
            <p className="text-xs text-[#94a3b8] opacity-70">
              Centro: {center.lat}, {center.lng}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {instalaciones.map((instalacion) => (
          <div
            key={instalacion.id}
            className="bg-[#0f172a] border border-[rgba(148,163,184,0.2)] rounded-lg p-4 hover:border-[#13ec80] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-bold text-[#f1f5f9] flex-1">{instalacion.nombre}</h4>
              <MapPin className="w-5 h-5 text-[#13ec80] flex-shrink-0 ml-2" />
            </div>

            <div className="space-y-2 text-sm text-[#94a3b8] mb-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{instalacion.direccion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{instalacion.horario}</span>
              </div>
              {instalacion.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{instalacion.telefono}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {instalacion.deportes.slice(0, 3).map((deporte) => (
                <span
                  key={deporte}
                  className="px-2 py-0.5 bg-[#13ec80] text-[#102219] text-xs font-medium rounded-full"
                >
                  {deporte}
                </span>
              ))}
              {instalacion.deportes.length > 3 && (
                <span className="px-2 py-0.5 bg-[#1e293b] text-[#94a3b8] text-xs font-medium rounded-full">
                  +{instalacion.deportes.length - 3}
                </span>
              )}
            </div>

            <Button
              size="sm"
              className="w-full bg-[#13ec80] hover:bg-[#10d671] text-[#102219] gap-2"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${instalacion.coordenadas.lat},${instalacion.coordenadas.lng}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="w-4 h-4" />
              Ver en Google Maps
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};