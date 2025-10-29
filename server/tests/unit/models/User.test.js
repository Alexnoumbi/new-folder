const mongoose = require('mongoose');
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        role: 'user',
        typeCompte: 'entreprise'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.nom).toBe(userData.nom);
      expect(savedUser.prenom).toBe(userData.prenom);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.typeCompte).toBe(userData.typeCompte);
    });

    it('should require nom field', async () => {
      const userData = {
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('Le nom est requis');
    });

    it('should require prenom field', async () => {
      const userData = {
        nom: 'Test',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('Le prénom est requis');
    });

    it('should require email field', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        motDePasse: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('L\'email est requis');
    });

    it('should require valid email format', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'invalid-email',
        motDePasse: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('Veuillez entrer un email valide');
    });

    it('should require motDePasse field', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('Le mot de passe est requis');
    });

    it('should enforce minimum password length', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: '123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('Le mot de passe doit contenir au moins 6 caractères');
    });

    it('should enforce unique email', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      await User.create(userData);
      const duplicateUser = new User(userData);
      await expect(duplicateUser.save()).rejects.toThrow('duplicate key error');
    });

    it('should validate role enum', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        role: 'invalid_role'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('`invalid_role` is not a valid enum value');
    });

    it('should validate typeCompte enum', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123',
        typeCompte: 'invalid_type'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('`invalid_type` is not a valid enum value');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user.motDePasse).not.toBe('password123');
      expect(user.motDePasse).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should not hash password if not modified', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      const user = new User(userData);
      await user.save();
      const originalHash = user.motDePasse;

      // Update non-password field
      user.nom = 'Updated';
      await user.save();

      expect(user.motDePasse).toBe(originalHash);
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };
      user = await User.create(userData);
    });

    it('should compare password correctly', async () => {
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should return public profile without password', () => {
      const publicProfile = user.getPublicProfile();
      
      expect(publicProfile.motDePasse).toBeUndefined();
      expect(publicProfile.nom).toBe(user.nom);
      expect(publicProfile.prenom).toBe(user.prenom);
      expect(publicProfile.email).toBe(user.email);
    });

    it('should check if user is admin', () => {
      expect(user.isAdmin()).toBe(false);

      user.role = 'admin';
      expect(user.isAdmin()).toBe(true);

      user.role = 'super_admin';
      expect(user.isAdmin()).toBe(true);
    });
  });

  describe('Virtual Properties', () => {
    it('should return full name', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      const user = await User.create(userData);
      expect(user.nomComplet).toBe('User Test');
    });
  });

  describe('Static Methods', () => {
    it('should find user by email (case insensitive)', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      await User.create(userData);

      const foundUser = await User.findByEmail('TEST@EXAMPLE.COM');
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('test@example.com');
    });
  });

  describe('Default Values', () => {
    it('should set default role to user', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      const user = await User.create(userData);
      expect(user.role).toBe('user');
    });

    it('should set default status to active', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      const user = await User.create(userData);
      expect(user.status).toBe('active');
    });

    it('should set default entrepriseIncomplete to false', async () => {
      const userData = {
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: 'password123'
      };

      const user = await User.create(userData);
      expect(user.entrepriseIncomplete).toBe(false);
    });
  });
});

