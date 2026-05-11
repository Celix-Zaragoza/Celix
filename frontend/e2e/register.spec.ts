import { test, expect } from "@playwright/test";

test.describe("Registro", () => {
  test("registro correcto redirige a crear perfil", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/register");

    await page.fill('input[name="nombre"]', "Test Usuario");
    await page.fill('input[name="alias"]', `test_${Date.now()}`);
    await page.fill('input[name="email"]', `test_${Date.now()}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/auth\/create-profile/, { timeout: 10000 });
  });

  test("registro con contraseñas distintas muestra error", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/register");

    await page.fill('input[name="nombre"]', "Test Usuario");
    await page.fill('input[name="alias"]', "test_alias");
    await page.fill('input[name="email"]', "test@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "diferente456");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Las contraseñas no coinciden")).toBeVisible({ timeout: 5000 });
  });
});