import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  // Navigate to root and wait for redirect to login (HashRouter)
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/#/login');
  });

  test('login form renders with all fields', async ({ page }) => {
    // Email field
    await expect(page.getByLabel('Dirección de Email')).toBeVisible();
    // Password field
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    // Submit button
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
    // Google OAuth button
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();
    // Remember me checkbox
    await expect(page.getByText('Recordarme')).toBeVisible();
    // Registration link
    await expect(page.getByText('Regístrese')).toBeVisible();
  });

  test('email field validates input', async ({ page }) => {
    const emailInput = page.getByLabel('Dirección de Email');
    const submitButton = page.getByRole('button', { name: 'Iniciar Sesión' });

    // Fill only password, leave email empty, try to submit
    await page.getByLabel('Contraseña').fill('Password123');
    await submitButton.click();

    // HTML5 validation should prevent submission — email is required
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });

  test('protected routes redirect to login', async ({ page }) => {
    // Try to access the dashboard directly via hash navigation
    await page.evaluate(() => window.location.hash = '#/dashboard');
    // Should be redirected back to login
    await page.waitForURL('**/#/login');
    await expect(page.getByText('Bienvenido a Escuela Segura')).toBeVisible();
  });

  test('register link navigates to registration page', async ({ page }) => {
    await page.getByText('Regístrese').click();
    await page.waitForURL('**/#/register');
    // Registration page should show the wizard
    await expect(page.getByText('Cree su Cuenta')).toBeVisible();
  });
});
