/**
 * Archivo: components/ConfirmModal.tsx
 * Descripción: Componente modal genérico para confirmación de acciones.
 * Soporta estilos de advertencia (danger) y es totalmente personalizable.
 */

"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Componente funcional que renderiza una ventana emergente de confirmación.
 * Utiliza un fondo oscurecido y previene la propagación de clics al contenido inferior.
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  
  // No renderiza nada si el estado 'open' es falso
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ backgroundColor: "#0f2318", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el mismo
      >
        {/* Cabecera con Icono y Título */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: danger ? "rgba(248,113,113,0.15)" : "rgba(19,236,128,0.12)" }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: danger ? "#f87171" : "#13ec80" }} />
          </div>
          <h3 className="text-lg font-black" style={{ color: "#f1f5f9" }}>{title}</h3>
        </div>

        {/* Descripción de la acción */}
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "#94a3b8" }}>
          {description}
        </p>

        {/* Acciones del Modal */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl text-sm font-bold transition-all"
            style={{
              backgroundColor: danger ? "#f87171" : "#13ec80",
              color: danger ? "#fff" : "#0a1628",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}