import { test, expect } from "@playwright/test";

test.describe("Publicaciones", () => {
  test("crear publicacion correctamente", async ({ page }) => {
    // Login previo
    await page.goto("http://localhost:3000/auth/login");
    await page.fill('input[type="email"]', "usrdemo@gmail.com");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/feed/, { timeout: 10000 });

    // Ir a crear publicación
    await page.goto("http://localhost:3000/app/create-post");

    // Seleccionar deporte (shadcn Select)
    await page.getByText("Selecciona un deporte").click();
    await page.getByRole("option", { name: "Baloncesto" }).click();

    // Seleccionar zona (shadcn Select)
    await page.getByText("Selecciona una zona").click();
    await page.getByRole("option", { name: "Centro" }).click();

    // Rellenar contenido (textarea sin name)
    await page.locator("textarea").fill("Test publicación E2E con Playwright");

    // Enviar
    await page.getByRole("button", { name: "Publicar" }).click();

    // Verificar redirección al feed
    await expect(page).toHaveURL(/\/app\/feed/, { timeout: 10000 });
  });
});