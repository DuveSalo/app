import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    // The page should load without errors
    await expect(page).toHaveTitle('Escuela Segura');
  });

  test('unauthenticated users see login page', async ({ page }) => {
    await page.goto('/');
    // HashRouter redirects unauthenticated users to /#/login
    await page.waitForURL('**/#/login');
    // Login form elements should be present
    await expect(page.getByText('Bienvenido a Escuela Segura')).toBeVisible();
  });

  test('main HTML structure is correct', async ({ page }) => {
    await page.goto('/');
    // Root element exists
    const root = page.locator('#root');
    await expect(root).toBeAttached();
    // Page language is set to Spanish
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('es');
  });
});
