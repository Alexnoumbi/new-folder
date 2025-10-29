const request = require('supertest');
const app = require('../../testServer');
const User = require('../../../models/User');
const Entreprise = require('../../../models/Entreprise');

describe('Auth Login Integration Tests', () => {
  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    await Entreprise.deleteMany({});
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const user = await User.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        typeCompte: 'entreprise'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Connexion réussie');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.motDePasse).toBeUndefined(); // Password should not be returned
    });

    it('should login admin user successfully', async () => {
      // Create admin user
      const adminUser = await User.create({
        nom: 'Admin',
        prenom: 'User',
        email: 'admin@example.com',
        motDePasse: 'admin123',
        role: 'admin',
        typeCompte: 'admin'
      });

      const loginData = {
        email: 'admin@example.com',
        password: 'admin123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('admin');
      expect(response.body.data.user.typeCompte).toBe('admin');
      expect(response.body.data.token).toBeDefined();
    });

    it('should login entreprise user with entreprise data', async () => {
      // Create entreprise
      const entreprise = await Entreprise.create({
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'TEST123'
        },
        contact: {
          email: 'entreprise@test.com'
        }
      });

      // Create user linked to entreprise
      const user = await User.create({
        nom: 'Test',
        prenom: 'User',
        email: 'entreprise@test.com',
        motDePasse: 'password123',
        typeCompte: 'entreprise',
        entrepriseId: entreprise._id
      });

      const loginData = {
        email: 'entreprise@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.entrepriseId).toBeDefined();
      expect(response.body.data.entreprise).toBeDefined();
      expect(response.body.data.entreprise.identification.nomEntreprise).toBe('Test Entreprise');
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email ou mot de passe incorrect');
    });

    it('should reject login with invalid password', async () => {
      // Create test user
      await User.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        typeCompte: 'entreprise'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email ou mot de passe incorrect');
    });

    it('should reject login with missing email', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject login with missing password', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle case insensitive email', async () => {
      // Create test user
      await User.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        typeCompte: 'entreprise'
      });

      const loginData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return JWT token with correct payload', async () => {
      // Create test user
      const user = await User.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        role: 'admin',
        typeCompte: 'admin'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const token = response.body.data.token;
      expect(token).toBeDefined();

      // Verify JWT token can be decoded
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.userId).toBe(user._id.toString());
      expect(decoded.role).toBe('admin');
    });

    it('should not return password in response', async () => {
      // Create test user
      await User.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        typeCompte: 'entreprise'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.data.user.motDePasse).toBeUndefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should handle inactive user', async () => {
      // Create inactive user
      await User.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        typeCompte: 'entreprise',
        status: 'inactive'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Compte inactif');
    });

    it('should handle pending user', async () => {
      // Create pending user
      await User.create({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        typeCompte: 'entreprise',
        status: 'pending'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Compte en attente');
    });
  });
});
