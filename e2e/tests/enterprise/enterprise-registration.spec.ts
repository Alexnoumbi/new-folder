import { test, expect } from '@playwright/test';

test.describe('Enterprise Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    // Check if registration form elements are present
    await expect(page.getByLabel('Nom')).toBeVisible();
    await expect(page.getByLabel('Prénom')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByLabel('Confirmer le mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'S\'inscrire' })).toBeVisible();
  });

  test('should register successfully with valid data', async ({ page }) => {
    // Fill registration form
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('Entreprise');
    await page.getByLabel('Email').fill('entreprise@test.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByLabel('Confirmer le mot de passe').fill('password123');
    await page.getByLabel('Téléphone').fill('+237123456789');
    
    // Select entreprise account type
    await page.getByLabel('Type de compte').selectOption('entreprise');
    
    // Submit form
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Wait for navigation to enterprise dashboard
    await expect(page).toHaveURL(/.*\/enterprise\/dashboard/);
    
    // Check if enterprise dashboard elements are present
    await expect(page.getByText('Tableau de bord Entreprise')).toBeVisible();
  });

  test('should show error with existing email', async ({ page }) => {
    // Fill form with existing email
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('User');
    await page.getByLabel('Email').fill('existing@test.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByLabel('Confirmer le mot de passe').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Check if error message is displayed
    await expect(page.getByText('Un utilisateur avec cet email existe déjà')).toBeVisible();
    
    // Should stay on registration page
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Check if validation errors are shown
    await expect(page.getByText('Le nom est requis')).toBeVisible();
    await expect(page.getByText('Le prénom est requis')).toBeVisible();
    await expect(page.getByText('L\'email est requis')).toBeVisible();
    await expect(page.getByText('Le mot de passe est requis')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    // Fill with invalid email format
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('User');
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByLabel('Confirmer le mot de passe').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Check if validation error is shown
    await expect(page.getByText('Veuillez entrer un email valide')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    // Fill with short password
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Mot de passe').fill('123');
    await page.getByLabel('Confirmer le mot de passe').fill('123');
    
    // Submit form
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Check if validation error is shown
    await expect(page.getByText('Le mot de passe doit contenir au moins 6 caractères')).toBeVisible();
  });

  test('should show validation error for password mismatch', async ({ page }) => {
    // Fill with mismatched passwords
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByLabel('Confirmer le mot de passe').fill('differentpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Check if validation error is shown
    await expect(page.getByText('Les mots de passe ne correspondent pas')).toBeVisible();
  });

  test('should create entreprise with default values after registration', async ({ page }) => {
    // Fill and submit registration form
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('Entreprise');
    await page.getByLabel('Email').fill('newentreprise@test.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByLabel('Confirmer le mot de passe').fill('password123');
    await page.getByLabel('Type de compte').selectOption('entreprise');
    
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Wait for navigation
    await expect(page).toHaveURL(/.*\/enterprise\/dashboard/);
    
    // Navigate to entreprise profile to check default values
    await page.getByText('Mon Entreprise').click();
    
    // Check if entreprise has default values
    await expect(page.getByText('Centre')).toBeVisible(); // Default region
    await expect(page.getByText('Yaoundé')).toBeVisible(); // Default city
    await expect(page.getByText('Tertiaire')).toBeVisible(); // Default sector
    await expect(page.getByText('En attente')).toBeVisible(); // Default status
  });

  test('should show loading state during registration', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/auth/register', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Fill form and submit
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByLabel('Confirmer le mot de passe').fill('password123');
    
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Check if loading state is shown
    await expect(page.getByText('Inscription en cours...')).toBeVisible();
    
    // Button should be disabled during loading
    await expect(page.getByRole('button', { name: 'S\'inscrire' })).toBeDisabled();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/auth/register', route => route.abort());
    
    // Fill form and submit
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByLabel('Confirmer le mot de passe').fill('password123');
    
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Check if error message is displayed
    await expect(page.getByText(/erreur de connexion|network error/i)).toBeVisible();
  });

  test('should redirect to login page after successful registration', async ({ page }) => {
    // Fill and submit registration form
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('User');
    await page.getByLabel('Email').fill('success@test.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByLabel('Confirmer le mot de passe').fill('password123');
    
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Should redirect to enterprise dashboard (auto-login)
    await expect(page).toHaveURL(/.*\/enterprise\/dashboard/);
  });

  test('should validate phone number format', async ({ page }) => {
    // Fill with invalid phone number
    await page.getByLabel('Nom').fill('Test');
    await page.getByLabel('Prénom').fill('User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByLabel('Confirmer le mot de passe').fill('password123');
    await page.getByLabel('Téléphone').fill('invalid-phone');
    
    // Submit form
    await page.getByRole('button', { name: 'S\'inscrire' }).click();
    
    // Check if validation error is shown
    await expect(page.getByText('Veuillez entrer un numéro de téléphone valide')).toBeVisible();
  });
});

