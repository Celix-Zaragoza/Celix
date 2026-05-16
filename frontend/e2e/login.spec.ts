/**
 * Archivo: e2e/login.spec.ts
 * Herramienta: Playwright
 * Objetivo: Validar el flujo crítico de autenticación, asegurando que los usuarios
 * autorizados acceden al sistema y los no autorizados son rechazados.
 */

import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  
  /**
   * Caso de uso: Happy Path (Camino feliz)
   * Verifica que, tras introducir credenciales válidas, el sistema 
   * establece la sesión y redirige al dashboard principal.
   */
  test("login correcto redirige al feed", async ({ page }) => {
    // 1. Navegación a la página de login
    await page.goto("http://localhost:3000/auth/login");

    // 2. Interacción con el DOM: Llenado de campos
    await page.fill('input[type="email"]', "875301@unizar.es");
    await page.fill('input[type="password"]', "123456");

    // 3. Acción: Envío del formulario
    await page.click('button[type="submit"]');

    // 4. Aserción: Comprobamos que la URL final coincide con el patrón del feed
    // Usamos una Regex para mayor flexibilidad (/\/app\/feed/)
    await expect(page).toHaveURL(/\/app\/feed/, { timeout: 10000 });
  });

  /**
   * Caso de uso: Manejo de errores
   * Verifica que el sistema detecta credenciales erróneas y proporciona
   * feedback visual al usuario en lugar de colgarse o redirigir.
   */
  test("login incorrecto muestra mensaje de error", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login");

    await page.fill('input[type="email"]', "malo@email.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Comprobamos que el mensaje de error definido en el backend/frontend
    // aparece en el DOM y es visible para el usuario.
    await expect(page.locator("text=Credenciales incorrectas")).toBeVisible({ timeout: 5000 });
  });
});