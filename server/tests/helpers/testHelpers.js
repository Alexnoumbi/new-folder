const jwt = require('jsonwebtoken');

/**
 * Helper functions for testing
 */

// Create test data factories
const createUserData = (overrides = {}) => ({
  nom: 'Test',
  prenom: 'User',
  email: `test${Date.now()}@example.com`,
  motDePasse: 'password123',
  role: 'user',
  typeCompte: 'entreprise',
  telephone: '+237123456789',
  ...overrides
});

const createEntrepriseData = (overrides = {}) => ({
  identification: {
    nomEntreprise: `Test Entreprise ${Date.now()}`,
    region: 'Centre',
    ville: 'Yaoundé',
    dateCreation: new Date(),
    secteurActivite: 'Tertiaire',
    sousSecteur: 'Autres',
    formeJuridique: 'EI',
    numeroContribuable: `TEST-${Date.now()}`
  },
  contact: {
    email: `test${Date.now()}@entreprise.com`
  },
  investissementEmploi: {
    effectifsEmployes: 10
  },
  statut: 'En attente',
  ...overrides
});

const createKPIData = (overrides = {}) => ({
  nom: 'Test KPI',
  description: 'Test KPI description',
  type: 'quantitatif',
  unite: 'nombre',
  valeurCible: 100,
  valeurActuelle: 50,
  ...overrides
});

// Authentication helpers
const createAuthToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

const createAdminToken = (userId) => {
  return createAuthToken(userId, 'admin');
};

// Database helpers
const clearDatabase = async () => {
  const mongoose = require('mongoose');
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Request helpers
const makeRequest = (app, method, url, data = null, token = null) => {
  let request = app[method.toLowerCase()](url);
  
  if (token) {
    request = request.set('Authorization', `Bearer ${token}`);
  }
  
  if (data) {
    request = request.send(data);
  }
  
  return request;
};

// Assertion helpers
const expectValidationError = (response, field) => {
  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toContain(field);
};

const expectAuthError = (response) => {
  expect(response.status).toBe(401);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toContain('Non autorisé');
};

const expectSuccess = (response, expectedData = null) => {
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
};

// Mock helpers
const mockEmailService = () => {
  const emailService = require('../utils/emailService');
  jest.spyOn(emailService, 'sendEmail').mockResolvedValue(true);
  return emailService;
};

const mockPDFGenerator = () => {
  const pdfGenerator = require('../utils/pdfGenerator');
  jest.spyOn(pdfGenerator, 'generatePDF').mockResolvedValue(Buffer.from('mock-pdf'));
  return pdfGenerator;
};

module.exports = {
  createUserData,
  createEntrepriseData,
  createKPIData,
  createAuthToken,
  createAdminToken,
  clearDatabase,
  makeRequest,
  expectValidationError,
  expectAuthError,
  expectSuccess,
  mockEmailService,
  mockPDFGenerator
};
