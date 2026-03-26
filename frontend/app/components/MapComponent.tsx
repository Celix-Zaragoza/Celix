"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Instalacion {
  id: string | number;
  nombre: string;
  direccion: string;
  telefono: string | null;
  horario: string | null;
  tipo: string;
  coordenadas: { lat: number; lng: number };
}

// El mapa de Leaflet solo funciona en cliente, nunca en SSR
// Por eso lo importamos dinámicamente dentro del useEffect

export const MapComponent = () => {
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // ── Cargar instalaciones ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchInstalaciones = async () => {
      try {
        const res = await fetch(`${API}/api/v1/instalaciones`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        if (data.ok) setInstalaciones(data.instalaciones ?? []);
        else throw new Error("Error en la respuesta");
      } catch (err) {
        setError("No se pudieron cargar las instalaciones.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstalaciones();
  }, []);

  // ── Inicializar mapa Leaflet ──────────────────────────────────────────────
  useEffect(() => {
    if (loading || error || instalaciones.length === 0) return;

    // Importar Leaflet solo en cliente
    import("leaflet").then((L) => {
      // Evitar doble inicialización
      const container = document.getElementById("celix-map") as any;
      if (!container) return;
      if (container._leaflet_id) return;

      // Fix icono por defecto de Leaflet con webpack/next
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const map = L.map("celix-map").setView([41.6488, -0.8891], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      instalaciones.forEach((inst) => {
        if (!inst.coordenadas.lat || !inst.coordenadas.lng) return;

        const marker = L.marker(
          [inst.coordenadas.lat, inst.coordenadas.lng],
          { icon: DefaultIcon }
        ).addTo(map);

        marker.bindPopup(`
          <div style="min-width:180px">
            <p style="font-weight:700;font-size:14px;margin:0 0 4px">${inst.nombre}</p>
            <p style="color:#64748b;font-size:12px;margin:0 0 2px">📍 ${inst.direccion || "Sin dirección"}</p>
            ${inst.telefono ? `<p style="color:#64748b;font-size:12px;margin:0 0 2px">📞 ${inst.telefono}</p>` : ""}
            ${inst.horario ? `<p style="color:#64748b;font-size:12px;margin:0">🕐 ${inst.horario}</p>` : ""}
          </div>
        `);
      });

      setMapReady(true);
    });

    // Cargar el CSS de Leaflet dinámicamente
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, [loading, error, instalaciones]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-[#13ec80] animate-spin" />
        <p className="text-[#94a3b8]">Cargando instalaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Contador */}
      <div className="flex items-center gap-2 p-3 border-b border-[rgba(148,163,184,0.2)]">
        <MapPin className="w-4 h-4 text-[#13ec80]" />
        <span className="text-sm text-[#94a3b8]">
          <span className="text-[#f1f5f9] font-semibold">{instalaciones.length}</span> instalaciones deportivas en Zaragoza
        </span>
      </div>

      {/* Mapa */}
      <div
        id="celix-map"
        style={{ height: "500px", width: "100%", zIndex: 0 }}
      />
    </div>
  );
};