/**
 * Archivo: e2e/posts.spec.ts
 * Descripción: Prueba el flujo de creación de contenido en CELIX.
 * Cubre: Login, navegación, interacción con componentes complejos (shadcn) 
 * y validación de persistencia visual (redirección).
 */

import { test, expect } from "@playwright/test";

test.describe("Publicaciones", () => {
  test("crear publicacion correctamente", async ({ page }) => {
    
    // 1. Fase de Precondición (Login)
    // Es necesario estar autenticado para crear posts.
    await page.goto("http://localhost:3000/auth/login");
    await page.fill('input[type="email"]', "usrdemo@gmail.com");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/feed/, { timeout: 10000 });

    // 2. Navegación al módulo de creación
    await page.goto("http://localhost:3000/app/create-post");

    // 3. Interacción con Selects de shadcn/ui
    /**
     * IMPORTANTE: Shadcn/Radix UI renderiza los Selects como botones que abren
     * una capa (portal) en el cuerpo del documento. getByText y getByRole 
     * son las mejores formas de interactuar con ellos sin IDs frágiles.
     */
    await page.getByText("Selecciona un deporte").click();
    await page.getByRole("option", { name: "Baloncesto" }).click();

    await page.getByText("Selecciona una zona").click();
    await page.getByRole("option", { name: "Centro" }).click();

    // 4. Llenado del cuerpo del post
    // Usamos el locator genérico "textarea" al ser el único en esta vista.
    await page.locator("textarea").fill("Test publicación E2E con Playwright");

    // 5. Envío y Validación
    await page.getByRole("button", { name: "Publicar" }).click();

    // Comprobamos que el sistema nos devuelve al feed, indicando éxito.
    await expect(page).toHaveURL(/\/app\/feed/, { timeout: 10000 });
  });
});