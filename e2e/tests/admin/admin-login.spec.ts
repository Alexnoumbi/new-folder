import { test, expect } from '@playwright/test';

test.describe('Admin Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check if login form elements are present
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('should login successfully with valid admin credentials', async ({ page }) => {
    // Fill login form
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Mot de passe').fill('admin123');
    
    // Submit form
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Wait for navigation to admin dashboard
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    
    // Check if admin dashboard elements are present
    await expect(page.getByText('Tableau de bord Admin')).toBeVisible();
    await expect(page.getByText('Statistiques')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill login form with invalid credentials
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Mot de passe').fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Check if error message is displayed
    await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible();
    
    // Should stay on login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Check if validation errors are shown
    await expect(page.getByText('L\'email est requis')).toBeVisible();
    await expect(page.getByText('Le mot de passe est requis')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    // Fill with invalid email format
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Mot de passe').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Check if validation error is shown
    await expect(page.getByText('Veuillez entrer un email valide')).toBeVisible();
  });

  test('should redirect to admin dashboard after successful login', async ({ page }) => {
    // Login
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Mot de passe').fill('admin123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Wait for navigation
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    
    // Check if admin navigation is present
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText('Entreprises')).toBeVisible();
    await expect(page.getByText('Utilisateurs')).toBeVisible();
    await expect(page.getByText('Rapports')).toBeVisible();
  });

  test('should remember login state on page refresh', async ({ page }) => {
    // Login
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Mot de passe').fill('admin123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Wait for navigation
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    
    // Refresh page
    await page.reload();
    
    // Should still be on admin dashboard
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    await expect(page.getByText('Tableau de bord Admin')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Mot de passe').fill('admin123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Wait for navigation
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    
    // Click logout button
    await page.getByRole('button', { name: /déconnexion/i }).click();
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByText('Se connecter')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/auth/login', route => route.abort());
    
    // Try to login
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Mot de passe').fill('admin123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Check if error message is displayed
    await expect(page.getByText(/erreur de connexion|network error/i)).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Fill form and submit
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Mot de passe').fill('admin123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Check if loading state is shown
    await expect(page.getByText('Connexion en cours...')).toBeVisible();
    
    // Button should be disabled during loading
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeDisabled();
  });
});

