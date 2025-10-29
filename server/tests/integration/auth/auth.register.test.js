const request = require('supertest');
const app = require('../../testServer');
const User = require('../../../models/User');
const Entreprise = require('../../../models/Entreprise');

describe('Auth Registration Integration Tests', () => {
  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    await Entreprise.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new entreprise user successfully', async () => {
      const userData = {
        email: 'entreprise@test.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'Entreprise',
        typeCompte: 'entreprise',
        telephone: '+237123456789'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Utilisateur créé avec succès');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.typeCompte).toBe('entreprise');
      expect(response.body.data.user.entrepriseId).toBeDefined();

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user.nom).toBe(userData.nom);
      expect(user.prenom).toBe(userData.prenom);
      expect(user.typeCompte).toBe('entreprise');

      // Verify entreprise was created for entreprise user
      const entreprise = await Entreprise.findById(user.entrepriseId);
      expect(entreprise).toBeDefined();
      expect(entreprise.identification.nomEntreprise).toContain(userData.prenom);
      expect(entreprise.contact.email).toBe(userData.email);
    });

    it('should register a new admin user successfully', async () => {
      const userData = {
        email: 'admin@test.com',
        password: 'password123',
        nom: 'Admin',
        prenom: 'User',
        typeCompte: 'admin',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.typeCompte).toBe('admin');
      expect(response.body.data.user.role).toBe('admin');
      expect(response.body.data.user.entrepriseId).toBeUndefined();

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user.role).toBe('admin');
      expect(user.entrepriseId).toBeUndefined();
    });

    it('should reject registration with existing email', async () => {
      // Create existing user
      const existingUser = await User.create({
        nom: 'Existing',
        prenom: 'User',
        email: 'existing@test.com',
        motDePasse: 'password123',
        typeCompte: 'entreprise'
      });

      const userData = {
        email: 'existing@test.com',
        password: 'password123',
        nom: 'New',
        prenom: 'User',
        typeCompte: 'entreprise'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Un utilisateur avec cet email existe déjà');
    });

    it('should reject registration with invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        typeCompte: 'entreprise'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Veuillez entrer un email valide');
    });

    it('should reject registration with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        nom: 'Test',
        prenom: 'User',
        typeCompte: 'entreprise'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Le mot de passe doit contenir au moins 6 caractères');
    });

    it('should reject registration with missing required fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
        // Missing nom, prenom, typeCompte
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create entreprise with default values for entreprise user', async () => {
      const userData = {
        email: 'entreprise@test.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'Entreprise',
        typeCompte: 'entreprise'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ email: userData.email });
      const entreprise = await Entreprise.findById(user.entrepriseId);

      // Verify entreprise has default values
      expect(entreprise.identification.region).toBe('Centre');
      expect(entreprise.identification.ville).toBe('Yaoundé');
      expect(entreprise.identification.secteurActivite).toBe('Tertiaire');
      expect(entreprise.identification.sousSecteur).toBe('Autres');
      expect(entreprise.identification.formeJuridique).toBe('EI');
      expect(entreprise.statut).toBe('En attente');
      expect(entreprise.conformite).toBe('Non vérifié');
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'User',
        typeCompte: 'entreprise'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ email: userData.email });
      expect(user.motDePasse).not.toBe(userData.password);
      expect(user.motDePasse).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should set default role to user for entreprise account', async () => {
      const userData = {
        email: 'entreprise@test.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'Entreprise',
        typeCompte: 'entreprise'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ email: userData.email });
      expect(user.role).toBe('user');
    });

    it('should set entrepriseIncomplete to true for entreprise user', async () => {
      const userData = {
        email: 'entreprise@test.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'Entreprise',
        typeCompte: 'entreprise'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ email: userData.email });
      expect(user.entrepriseIncomplete).toBe(true);
    });

    it('should generate unique numeroContribuable for entreprise', async () => {
      const userData = {
        email: 'entreprise@test.com',
        password: 'password123',
        nom: 'Test',
        prenom: 'Entreprise',
        typeCompte: 'entreprise'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ email: userData.email });
      const entreprise = await Entreprise.findById(user.entrepriseId);

      expect(entreprise.identification.numeroContribuable).toMatch(/^TMP-\d+$/);
    });

    it('should handle registration with special characters in names', async () => {
      const userData = {
        email: 'entreprise@test.com',
        password: 'password123',
        nom: 'Test-Name',
        prenom: 'Jean-Pierre',
        typeCompte: 'entreprise'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.nom).toBe('Test-Name');
      expect(response.body.data.user.prenom).toBe('Jean-Pierre');
    });
  });
});
