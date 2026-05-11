import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("login correcto redirige al feed", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login");

    await page.fill('input[type="email"]', "875301@unizar.es");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/app\/feed/, { timeout: 10000 });
  });

  test("login incorrecto muestra mensaje de error", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/login");

    await page.fill('input[type="email"]', "malo@email.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Credenciales incorrectas")).toBeVisible({ timeout: 5000 });
  });
});