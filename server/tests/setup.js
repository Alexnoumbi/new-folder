const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup global test environment
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clean up database between tests
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test utilities
global.testUtils = {
  // Helper to create test user
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    const defaultUser = {
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      motDePasse: 'password123',
      role: 'user',
      typeCompte: 'entreprise',
      ...userData
    };
    return await User.create(defaultUser);
  },

  // Helper to create test entreprise
  createTestEntreprise: async (entrepriseData = {}) => {
    const Entreprise = require('../models/Entreprise');
    const defaultEntreprise = {
      identification: {
        nomEntreprise: 'Test Entreprise',
        region: 'Centre',
        ville: 'Yaoundé',
        dateCreation: new Date(),
        secteurActivite: 'Tertiaire',
        sousSecteur: 'Autres',
        formeJuridique: 'EI',
        numeroContribuable: `TEST-${Date.now()}`
      },
      contact: {
        email: 'test@entreprise.com'
      },
      statut: 'En attente',
      ...entrepriseData
    };
    return await Entreprise.create(defaultEntreprise);
  },

  // Helper to create JWT token
  createJWTToken: (userId, role = 'user') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },

  // Helper to make authenticated request
  makeAuthenticatedRequest: (app, token) => {
    return (method, url) => {
      return app[method](url)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');
    };
  }
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

