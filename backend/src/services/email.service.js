/**
 * @file email.service.js
 * @description Configuración del transporte de correo y funciones para el envío
 * de notificaciones por email a los usuarios.
 */

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,    // tu cuenta gmail
    pass: process.env.EMAIL_PASS,    // contraseña de aplicación (no la de gmail)
  },
});

/**
 * Envía un email al usuario notificándole que su publicación ha sido ocultada.
 * @param {string} to - Dirección de email del destinatario.
 * @param {string} nombre - Nombre del usuario.
 * @param {string} contenido - Contenido de la publicación ocultada.
 */
export async function sendPostHiddenEmail({ to, nombre, contenido }) {
  await transporter.sendMail({
    from: `"CELIX" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tu publicación ha sido ocultada — CELIX",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#13ec80">CELIX</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu publicación ha sido <strong>ocultada</strong> por un administrador por no cumplir con las normas de la comunidad.</p>
        <blockquote style="border-left:3px solid #13ec80;padding-left:12px;color:#666;margin:16px 0">
          "${contenido.slice(0, 100)}${contenido.length > 100 ? "..." : ""}"
        </blockquote>
        <p>Si crees que es un error, puedes contactar con el equipo de CELIX.</p>
        <p style="color:#999;font-size:12px;margin-top:32px">© 2025 CELIX Zaragoza</p>
      </div>
    `,
  });
}

/**
 * Envía un email al usuario notificándole que su publicación ha sido restaurada.
 * @param {string} to - Dirección de email del destinatario.
 * @param {string} nombre - Nombre del usuario.
 * @param {string} contenido - Contenido de la publicación restaurada.
 */
export async function sendPostRestoredEmail({ to, nombre, contenido }) {
  await transporter.sendMail({
    from: `"CELIX" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tu publicación ha sido restaurada — CELIX",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#13ec80">CELIX</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu publicación ha sido <strong>restaurada</strong> y ya es visible de nuevo en la plataforma.</p>
        <blockquote style="border-left:3px solid #13ec80;padding-left:12px;color:#666;margin:16px 0">
          "${contenido.slice(0, 100)}${contenido.length > 100 ? "..." : ""}"
        </blockquote>
        <p style="color:#999;font-size:12px;margin-top:32px">© 2025 CELIX Zaragoza</p>
      </div>
    `,
  });
}

/**
 * Envía un email al usuario notificándole que su cuenta ha sido bloqueada.
 * @param {string} to - Dirección de email del destinatario.
 * @param {string} nombre - Nombre del usuario.
 * @param {string} motivo - Motivo del bloqueo (opcional).
 */
export async function sendUserBlockedEmail({ to, nombre, motivo }) {
  await transporter.sendMail({
    from: `"CELIX" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tu cuenta ha sido bloqueada — CELIX",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#13ec80">CELIX</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu cuenta ha sido <strong>bloqueada</strong> temporalmente por un administrador.</p>
        ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ""}
        <p>Durante el bloqueo no podrás acceder a la plataforma ni utilizar sus funcionalidades.</p>
        <p>Si crees que es un error, contacta con el equipo de CELIX.</p>
        <p style="color:#999;font-size:12px;margin-top:32px">© 2025 CELIX Zaragoza</p>
      </div>
    `,
  });
}

/**
 * Envía un email al usuario notificándole que su cuenta ha sido desbloqueada.
 * @param {string} to - Dirección de email del destinatario.
 * @param {string} nombre - Nombre del usuario.
 */
export async function sendUserUnblockedEmail({ to, nombre }) {
  await transporter.sendMail({
    from: `"CELIX" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tu cuenta ha sido desbloqueada — CELIX",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#13ec80">CELIX</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu cuenta ha sido <strong>desbloqueada</strong>. Ya puedes acceder a CELIX con normalidad.</p>
        <p>Recuerda cumplir con las normas de la comunidad para evitar futuros bloqueos.</p>
        <p style="color:#999;font-size:12px;margin-top:32px">© 2025 CELIX Zaragoza</p>
      </div>
    `,
  });
}