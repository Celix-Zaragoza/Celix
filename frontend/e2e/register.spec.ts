/**
 * Archivo: tests/register.spec.ts
 * Descripción: Verifica el proceso de alta de nuevos deportistas.
 * Puntos clave: Generación de datos dinámicos y validación de reglas de negocio en cliente.
 */

import { test, expect } from "@playwright/test";

test.describe("Registro", () => {
  
  /**
   * Test: Flujo de éxito dinámico.
   * Usamos Date.now() para generar alias y emails únicos en cada ejecución,
   * evitando errores de "usuario ya existe" en el backend.
   */
  test("registro correcto redirige a crear perfil", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/register");

    // Llenado de campos con selectores por atributo 'name'
    await page.fill('input[name="nombre"]', "Test Usuario");
    await page.fill('input[name="alias"]', `test_${Date.now()}`);
    await page.fill('input[name="email"]', `test_${Date.now()}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    
    await page.click('button[type="submit"]');

    // Tras el registro inicial, el usuario debe ir al paso 2: Configuración de perfil
    await expect(page).toHaveURL(/\/auth\/create-profile/, { timeout: 10000 });
  });

  /**
   * Test: Validación de integridad de datos.
   * Verifica que la lógica de validación (probablemente Zod o similar) 
   * bloquea el registro si las contraseñas no son idénticas.
   */
  test("registro con contraseñas distintas muestra error", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/register");

    await page.fill('input[name="nombre"]', "Test Usuario");
    await page.fill('input[name="alias"]', "test_alias");
    await page.fill('input[name="email"]', "test@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "diferente456");
    await page.click('button[type="submit"]');

    // El test busca el mensaje de error específico que el frontend debe renderizar
    await expect(page.locator("text=Las contraseñas no coinciden")).toBeVisible({ timeout: 5000 });
  });
});